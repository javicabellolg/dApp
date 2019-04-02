pragma solidity >=0.4.22 <0.6.0;

import './Ownable.sol';
//import './SafeMath.sol';
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract interfaceToBlacklist{
    function addToBlackList(address _client, uint _id) public;
}

contract interfaceCheckAmount{
    function checkAmount (address _client) public view returns (uint);
}

contract DAO is Ownable {
    using SafeMath for uint;
    uint public minimumQuorum;
    uint public debatingPeriodInSeconds;
    int public majorityMargin;
    bool isStopped = false;

    interfaceToBlacklist public toBlackList;
    interfaceCheckAmount public check;

    struct Proposal {
        address client;
        address proposalOwner;
        uint idBill;
	uint amount;
        string description;
        uint minExecutionDate;
        bool executed;
        bool proposalPassed;
        uint numberOfVotes;
        uint positiveVotes;
        uint negativeVotes;
        //Vote[] votes;
        mapping (address => bool) voted; // Se guarda si un votante ya ha votado
        mapping (address => Vote) voting; // Se guarda el histórico de votos de cada votante
    }

    struct Vote {
        bool vote;
        string justification;
    }

    event ChangeOfRules(uint newMinimumQuorum, uint newDebatingPeriodInSeconds, int newMajorityMargin);
    //struct Result{
    //
    //}

    Proposal[] public proposals;

    mapping (address => bool) public memberId;
    mapping (uint => Proposal) public idToProposal;
    //mapping (address => Vote) public addressToVoteHistory;



    constructor (
        uint minimumQuorumForProposals,
        uint secondsForDebate,
        int marginOfVotesForMajority
    )  payable public {
        changeVotingRules(minimumQuorumForProposals, secondsForDebate, marginOfVotesForMajority);
        // It’s necessary to add an empty first member
        addMember(msg.sender);
        // and let's add the founder, to save a step later
        //addMember(owner, 'founder');
    }

    modifier onlyMembers {
        require(memberId[msg.sender] != false);
        _;
    }

    modifier onlyNoVoters (uint _id) {
        require (idToProposal[_id].voted[msg.sender] == false);
        _;
    }

    modifier onlyNoExecuted (uint _id) {
        require (idToProposal[_id].executed == false);
        _;
    }

    modifier onlyProposalOwner (uint _id) {
        require (idToProposal[_id].proposalOwner == msg.sender);
        _;
    }

    modifier stoppedInEmergency {
        require(!isStopped, "El contrato está parado");
        _;
    }

    function newProposal(uint _id, address _client, uint _idBill, string _description) public stoppedInEmergency onlyMembers{
        require (idToProposal[_id].client==0, "El id de la propuesta corresponde a uno anterior");
        idToProposal[_id].client = _client;
	idToProposal[_id].idBill = _idBill;
        idToProposal[_id].proposalOwner = msg.sender;
        idToProposal[_id].amount = check.checkAmount(_client);
        idToProposal[_id].description = _description;
        idToProposal[_id].minExecutionDate = now.add(debatingPeriodInSeconds).add(1 minutes);
        idToProposal[_id].executed = false;
        idToProposal[_id].numberOfVotes = 0;
        idToProposal[_id].positiveVotes = 0;
        idToProposal[_id].negativeVotes = 0;
    }

    function voting(uint _id, bool _vote, string _justification) public stoppedInEmergency onlyMembers onlyNoVoters (_id) onlyNoExecuted (_id){
        idToProposal[_id].voted[msg.sender] = true;
        idToProposal[_id].numberOfVotes++;
        idToProposal[_id].voting[msg.sender].vote = _vote;
        idToProposal[_id].voting[msg.sender].justification = _justification;
        if (_vote){
            idToProposal[_id].positiveVotes++;
        } else {idToProposal[_id].negativeVotes++;}
    }

    function addMember(address _member) public onlyOwner {
        memberId[_member] = true;
    }

    function execution(uint _id) public stoppedInEmergency onlyProposalOwner (_id){
        require (now > idToProposal[_id].minExecutionDate, "No ha pasado el tiempo requerido de debate de la propuesta");
        require (idToProposal[_id].numberOfVotes >=  minimumQuorum && idToProposal[_id].positiveVotes > idToProposal[_id].negativeVotes, "No se ejecuta al no haber consenso en la Organización");
        idToProposal[_id].executed = true;
	toBlackList.addToBlackList(idToProposal[_id].client, idToProposal[_id].idBill);
    }

    function changeVotingRules(
        uint minimumQuorumForProposals,
        uint secondsForDebate,
        int marginOfVotesForMajority
    ) onlyOwner public {
        minimumQuorum = minimumQuorumForProposals;
        debatingPeriodInSeconds = secondsForDebate;
        majorityMargin = marginOfVotesForMajority;

        emit ChangeOfRules(minimumQuorum, debatingPeriodInSeconds, majorityMargin);
    }

    function setInterfaceToBlacklist (address _address) public onlyOwner{
	toBlackList = interfaceToBlacklist(_address);
    }

    function setInterfaceChackAmount (address _address) public onlyOwner{
	check = interfaceCheckAmount (_address); // Esta es la dirección del contrato de gestión de cobro.
    }

    function resumeContract() public onlyOwner {
        isStopped = false;
    }

    function stopContract() public onlyOwner {
        isStopped = true;
    }

}


