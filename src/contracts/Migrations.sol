pragma solidity >=0.4.21 <0.6.0;

contract Migrations {
  address public owner;
  uint public last_completed_migration; // lần di chuyển hoàn thành cuối cùng

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  // thiết lập hoàn thành
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  // nâng cấp
  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
