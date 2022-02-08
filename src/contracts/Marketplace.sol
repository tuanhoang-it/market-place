pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint256 public productCount = 0; // lượng sản phẩm ban đầu
    mapping(uint256 => Product) public products;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased // trạng thái mua hàng
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    // người bán
    function createProduct(string memory _name, uint256 _price) public {
        // Yêu cầu một tên hợp lệ
        require(bytes(_name).length > 0);
        // Require a valid price
        require(_price > 0);
        // Số lượng sản phẩm gia tăng
        productCount++;
        // Tạo sản phẩm
        products[productCount] = Product(
            productCount,
            _name,
            _price,
            msg.sender,
            false // chưa có người mua
        );
        // Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    // người mua
    function purchaseProduct(uint256 _id) public payable {
        // Tìm nạp sản phẩm
        Product memory _product = products[_id];
        // Tìm nạp chủ sở hữu
        address payable _seller = _product.owner;
        // Đảm bảo sản phẩm có id hợp lệ
        require(_product.id > 0 && _product.id <= productCount);
        // Yêu cầu có đủ Ether trong giao dịch
        require(msg.value >= _product.price);
        // Yêu cầu sản phẩm chưa được mua
        require(!_product.purchased);
        // Yêu cầu người mua không phải là người bán
        require(_seller != msg.sender);
        // Chuyển quyền sở hữu cho người mua
        _product.owner = msg.sender;
        // Đánh dấu là đã mua
        _product.purchased = true;
        // Cập nhật sản phẩm
        products[_id] = _product;
        // Thanh toán cho người bán bằng cách gửi Ether cho họ
        address(_seller).transfer(msg.value); // tranfer là 1 chức năng chuyển eth
        // Kích hoạt một sự kiện
        emit ProductPurchased(
            productCount,
            _product.name,
            _product.price,
            msg.sender,
            true
        );
    }
}
