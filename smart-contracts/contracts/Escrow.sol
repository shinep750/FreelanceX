// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public admin;

    enum MilestoneStatus { Pending, Funded, InProgress, Completed, Released, Disputed }

    struct Milestone {
        uint256 id;
        uint256 projectId;
        address client;
        address freelancer;
        uint256 amount;
        MilestoneStatus status;
    }

    mapping(uint256 => Milestone) public projectMilestones;

    // Events
    event ContractCreated(address admin);
    event MilestoneFunded(uint256 indexed projectId, address indexed client, uint256 amount);
    event PaymentReleased(uint256 indexed projectId, address indexed freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed projectId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed projectId, bool releaseToFreelancer);

    constructor() {
        admin = msg.sender;
        emit ContractCreated(admin);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyClient(uint256 _projectId) {
        require(msg.sender == projectMilestones[_projectId].client, "Only client can call this");
        _;
    }

    modifier onlyParticipant(uint256 _projectId) {
        require(
            msg.sender == projectMilestones[_projectId].client || msg.sender == projectMilestones[_projectId].freelancer,
            "Only project participants can call this"
        );
        _;
    }

    // Creating milestone record offchain then funding it on-chain
    function fundMilestone(uint256 _projectId, address _freelancer) external payable {
        require(msg.value > 0, "Amount must be greater than zero");
        require(projectMilestones[_projectId].id == 0, "Milestone already funded for this project");

        projectMilestones[_projectId] = Milestone({
            id: _projectId,
            projectId: _projectId,
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            status: MilestoneStatus.Funded
        });

        emit MilestoneFunded(_projectId, msg.sender, msg.value);
    }

    // Client releases payment to freelancer
    function releasePayment(uint256 _projectId) external onlyClient(_projectId) {
        Milestone storage m = projectMilestones[_projectId];
        require(m.status == MilestoneStatus.Funded || m.status == MilestoneStatus.InProgress || m.status == MilestoneStatus.Completed, "Milestone is not in a releasable state");

        m.status = MilestoneStatus.Released;
        payable(m.freelancer).transfer(m.amount);

        emit PaymentReleased(_projectId, m.freelancer, m.amount);
    }

    // Either party raises a dispute
    function raiseDispute(uint256 _projectId) external onlyParticipant(_projectId) {
        Milestone storage m = projectMilestones[_projectId];
        require(m.status != MilestoneStatus.Released, "Funds already released");

        m.status = MilestoneStatus.Disputed;

        emit DisputeRaised(_projectId, msg.sender);
    }

    // Admin resolves dispute
    function resolveDispute(uint256 _projectId, bool _releaseToFreelancer) external onlyAdmin {
        Milestone storage m = projectMilestones[_projectId];
        require(m.status == MilestoneStatus.Disputed, "Milestone is not disputed");

        if (_releaseToFreelancer) {
            m.status = MilestoneStatus.Released;
            payable(m.freelancer).transfer(m.amount);
            emit DisputeResolved(_projectId, true);
            emit PaymentReleased(_projectId, m.freelancer, m.amount);
        } else {
            // Refund the client
            m.status = MilestoneStatus.Completed; // Or create a 'Refunded' status 
            payable(m.client).transfer(m.amount);
            emit DisputeResolved(_projectId, false);
        }
    }
}
