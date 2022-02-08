// eslint-disable-next-line no-undef
const Marketplace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
};

// Tệp này yêu cầu Truffle triển khai hợp đồng thông minh vào chuỗi khối.