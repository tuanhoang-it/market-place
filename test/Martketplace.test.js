/* eslint-disable no-undef */
const Marketplace = artifacts.require('./Marketplace.sol') // import hợp đồng

// thêm một số công cụ bổ sung vào bộ thử nghiệm
require('chai')
  .use(require('chai-as-promised'))
  .should()

// thêm 3 tài khoản mới vào kịch bản thử nghiệm deployer, seller và buyer
contract('Marketplace', ([deployer, seller, buyer]) => { // người triển khai, người bán, người mua
  let marketplace

  // thiết lập ví dụ thử nghiệm với một before
  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  // tạo một ví dụ thử nghiệm mới để tạo sản phẩm:
  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Dapp University Marketplace')
    })
  })

  describe('products', async () => {
    let result, productCount

    before(async () => {
      result = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller })
      productCount = await marketplace.productCount()
    })

    it('creates products', async () => {
      // SUCCESS
      // kiểm tra việc tạo sản phẩm đã làm tăng số lượng sản phẩm lên 1
      assert.equal(productCount, 1) 

      // kiểm tra nhật ký sự kiện của hợp đồng thông minh để biết rằng sản phẩm đã được tạo với các giá trị chính xác
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      // THẤT ​​BẠI: Sản phẩm phải có tên
      await await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // THẤT ​​BẠI: Sản phẩm phải có giá
      await await marketplace.createProduct('iPhone X', 0, { from: seller }).should.be.rejected;
    })
    it('sells products', async () => {
      // Theo dõi số dư người bán trước khi mua hàng
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)
    
      // THÀNH CÔNG: Người mua mua hàng
      result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})
    
      // kiểm tra nhật ký
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, true, 'purchased is correct')
    
      // Kiểm tra xem người bán đã nhận được tiền chưa
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)
    
      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)
    
      const exepectedBalance = oldSellerBalance.add(price)
    
      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())
    
      // THẤT BẠI: Cố gắng mua một sản phẩm không tồn tại, tức là sản phẩm phải có id hợp lệ
      await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;      // FAILURE: Buyer tries to buy without enough ether
      // THẤT BẠI: Người mua cố gắng mua mà không có đủ ether
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      // THẤT BẠI: Người triển khai cố gắng mua sản phẩm, tức là không thể mua sản phẩm hai lần
      await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      // THẤT BẠI: Người mua cố gắng mua lại, tức là người mua không thể là người bán
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })
  })
})