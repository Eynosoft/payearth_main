import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import Header from '../../components/admin/common/Header';
import Footer from '../../components/common/Footer';
import store from '../../store/index';
import { setLoading } from '../../store/reducers/global-reducer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import NotFound from '../../components/common/NotFound';
import SpinnerLoader from '../../components/common/SpinnerLoader';

class Orders extends Component {
    constructor(props) {
        super(props)
        const { dispatch } = props;
        this.dispatch = dispatch;
        this.authInfo = store.getState().auth.authInfo;
        this.state = {
            reqBody: {
                count: {
                    page: 1,
                    skip: 0,
                    limit: 2
                },
                sorting: {
                    sort_type: "date",
                    sort_val: "desc"
                },
                filter: {
                    type: "ongoing",
                    is_service: false
                }

            },
            pendingProducts: [],
            ongoingProducts: [],
            canceledProducts: [],
            completedProducts: [],
            pendingProductsPagination: {},
            ongoingProductsPagination: {},
            canceledProductsPagination: {},
            completedProductsPagination: {}
            // sortingOptions: [
            //     {label: 'New to Old', value: 'desc'},
            //     {label: "Old to New ", value: 'asc'},
            // ],
            // defaultSelectedOption: {label: 'New to Old', value: 'desc'}
        };
    }
    componentDidMount() {
        this.getOrders(false, null, 'pending');
        this.getOrders(false, null, 'ongoing');
        this.getOrders(false, null, 'cancel_refund');
        this.getOrders(false, null, 'completed');
    }
    getOrders = (pagination, param, type) => {
        let reqBody = {};

        if (pagination === true) {
            reqBody = {
                count: {
                    page: param,
                    skip: (param - 1) * 2,
                    limit: 2
                },
                filter: {
                    type: "ongoing",
                    is_service: false
                }
            };
        } else {
            reqBody = this.state.reqBody;
        }

        reqBody.filter.type = type;

        const { dispatch } = this.props;
        dispatch(setLoading({ loading: true }));
        axios.post('admin/orders/', reqBody, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': `Bearer ${this.authInfo.token}`
            }
        }).then((response) => {
            if (response.data.status) {
                let types = {
                    pending: 'pendingProducts',
                    ongoing: 'ongoingProducts',
                    cancel_refund: 'canceledProducts',
                    complete: 'completedProducts'
                };
                let paginationNames = {
                    pending: 'pendingProductsPagination',
                    ongoing: 'ongoingProductsPagination',
                    cancel_refund: 'canceledProductsPagination',
                    complete: 'completedProductsPagination'
                };

                let obj = {};
                obj[types[type]] = response.data.data.orders;
                obj[paginationNames[type]] = response.data.data.paginationData;
                this.setState(obj);
            }
        }).catch(error => {
            if (error.response && error.response.data.status === false) {
                toast.error(error.response.data.message);
            }
        }).finally(() => {
            setTimeout(() => {
                dispatch(setLoading({ loading: false }));
            }, 300);
        });
    }

    pagination = (type) => {
        let html = [];
        let itemLength = 0;
        let currentPage = 0;

        if (type === 'pending') {
            itemLength = this.state.pendingProductsPagination.totalPages;
            currentPage = this.state.pendingProductsPagination.currentPage;
        } else if (type === 'ongoing') {
            itemLength = this.state.ongoingProductsPagination.totalPages;
            currentPage = this.state.ongoingProductsPagination.currentPage;
        } else if (type === 'cancel_refund') {
            itemLength = this.state.canceledProductsPagination.totalPages;
            currentPage = this.state.canceledProductsPagination.currentPage;
        }
        else if (type === 'completed') {
            itemLength = this.state.completedProductsPagination.totalPages;
            currentPage = this.state.completedProductsPagination.currentPage;
        }

        for (let index = 0; index < itemLength; index++) {
            let pageNumber = index + 1;
            html.push(<li key={index}><Link to="#" className={`link ${currentPage === pageNumber ? 'active' : ''}`} onClick={() => this.getOrders(true, pageNumber, type)}>{pageNumber}</Link></li>);
        }
        return html;
    }
    render() {
        const { pendingProducts, ongoingProducts, canceledProducts, completedProducts, pendingProductsPagination, ongoingProductsPagination, canceledProductsPagination, completedProductsPagination } = this.state;
        const { loading } = store.getState().global
        return (
            <React.Fragment>
                {loading === true ? <SpinnerLoader /> : ''}
                <div className="seller_body">
                    <Header />
                    <div className="seller_dash_wrap pt-5 pb-5">
                        <div className="container ">
                            <div className="bg-white rounded-3 pt-3 pb-5">
                                <div className="dash_inner_wrap">
                                    <div className="col-md-12 pt-2 pb-3 d-flex justify-content-between align-items-center">
                                        <div className="dash_title">Orders</div>
                                        <div className="mpc_btns search_box d-flex align-items-center">
                                            <div className="input-group me-2">
                                                <input type="text" className="form-control" placeholder="Search products" aria-label="Search products" aria-describedby="button-addon2" />
                                                <button className="btn btn-outline-secondary" type="button" id="button-addon2">Search</button>
                                            </div>
                                            <button className="btn custom_btn btn_yellow filter_btn" type="button" id="dropdownMenuFilter" data-bs-toggle="dropdown" aria-expanded="true">
                                                Filter
                                            </button>
                                            <div className="dropdown-menu filter_drop  dropdown-menu-lg-end" aria-labelledby="dropdownMenuFilter">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <ul className="filter_ul">
                                                            <li><b>Basic filter</b></li>
                                                            <li>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDate" />
                                                                    <label className="form-check-label" htmlFor="flexCheckDate">Date</label>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckVendor" />
                                                                    <label className="form-check-label" htmlFor="flexCheckVendor">Vendor</label>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckStatus" />
                                                                    <label className="form-check-label" htmlFor="flexCheckStatus">Status</label>
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckCustomer" />
                                                                    <label className="form-check-label" htmlFor="flexCheckCustomer">Customer</label>
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div className="col-md-7 offset-lg-1">
                                                        <ul className="filter_ul">
                                                            <li><b>Advance filter</b></li>
                                                            <li>
                                                                <input type="date" className="form-control" name="" id="" />
                                                            </li>
                                                            <li>
                                                                <input type="search" className="form-control" name="" id="" placeholder="Vendor" />
                                                            </li>
                                                            <li>
                                                                <select className="form-select" aria-label="Default select">
                                                                    <option >Status</option>
                                                                    <option value="1">One</option>
                                                                    <option value="2">Two</option>
                                                                    <option value="3">Three</option>
                                                                </select>
                                                            </li>
                                                            <li>
                                                                <input type="search" className="form-control" name="" id="" placeholder="Customer" />
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <nav className="orders_tabs">

                                    <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                                        <button className="nav-link active" id="nav-pending-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-pending-orders" type="button" role="tab" aria-controls="nav-pending-orders" aria-selected="true">Pending Orders</button>
                                        <button className="nav-link" id="nav-ongoing-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-ongoing-orders" type="button" role="tab" aria-controls="nav-ongoing-orders" aria-selected="false">Ongoing Orders</button>
                                        <button className="nav-link" id="nav-cancelled-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-cancelled-orders" type="button" role="tab" aria-controls="nav-cancelled-orders" aria-selected="true">Cancelled and Refunded Orders</button>
                                        <button className="nav-link" id="nav-completed-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-completed-orders" type="button" role="tab" aria-controls="nav-completed-orders" aria-selected="true">Completed Orders</button>
                                    </div>
                                </nav>
                                <div className="orders_table tab-content pt-0 pb-0" id="nav-tabContent">
                                    <div className="tab-pane fade show active" id="nav-pending-orders" role="tabpanel" aria-labelledby="nav-pending-orders-tab">
                                        {pendingProducts.length > 0 ?
                                            <table className="table table-responsive table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Product ID</th>
                                                        <th>Product<br />Name</th>
                                                        <th>Product<br />Color</th>
                                                        <th>Product<br />Size</th>
                                                        <th>Vendor’s<br />Share</th>
                                                        <th>Vendor’s<br />Name</th>
                                                        <th>Status</th>
                                                        <th colSpan="2">Mode of<br />Payment</th>
                                                        {/* <th className="invisible">action</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingProducts.length && pendingProducts.map((value, index) => {
                                                        return (

                                                            <tr key={index}>
                                                                <td>{value.orderCode}</td>
                                                                <td>{value.productId.productCode}</td>
                                                                <td>{value.productId.name}</td>
                                                                <td>{value.product_sku.color}</td>
                                                                <td>{value.product_sku.size}</td>
                                                                <td>${value.paymentId.amountPaid}</td>
                                                                <td>{value.sellerId.name}</td>
                                                                <td>{value.orderStatus.orderStatusId.title}</td>
                                                                <td>{value.paymentId.paymentMode}</td>
                                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                            : <NotFound msg="Data not found." />
                                        }
                                        {pendingProducts.length > 0 &&
                                            <div className="pagination">
                                                <ul>
                                                    <li><Link to="#" className={`link ${pendingProductsPagination.hasPrevPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, pendingProductsPagination.prevPage, 'pending')}><span className="fa fa-angle-left me-2"></span> Prev</Link></li>
                                                    {this.pagination('pending')}
                                                    <li><Link to="#" className={`link ${pendingProductsPagination.hasNextPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, pendingProductsPagination.nextPage, 'pending')}>Next <span className="fa fa-angle-right ms-2"></span></Link></li>
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="nav-ongoing-orders" role="tabpanel" aria-labelledby="nav-ongoing-orders-tab">
                                        {ongoingProducts.length > 0 ?
                                            <table className="table table-responsive table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Product ID</th>
                                                        <th>Product<br />Name</th>
                                                        <th>Product<br />Color</th>
                                                        <th>Product<br />Size</th>
                                                        <th>Vendor’s<br />Share</th>
                                                        <th>Vendor’s<br />Name</th>
                                                        <th>Status</th>
                                                        <th colSpan="2">Mode of<br />Payment</th>
                                                        {/* <th className="invisible">action</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ongoingProducts.length && ongoingProducts.map((value, index) => {
                                                        return (

                                                            <tr key={index}>
                                                                <td>{value.orderCode}</td>
                                                                <td>{value.productId.productCode}</td>
                                                                <td>{value.productId.name}</td>
                                                                <td>{value.product_sku.color}</td>
                                                                <td>{value.product_sku.size}</td>
                                                                <td>${value.paymentId.amountPaid}</td>
                                                                <td>{value.sellerId.name}</td>
                                                                <td>{value.orderStatus.orderStatusId.title}</td>
                                                                <td>{value.paymentId.paymentMode}</td>
                                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                                            </tr>

                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                            : <NotFound msg="Data not found." />
                                        }
                                        {ongoingProducts.length > 0 &&
                                            <div className="pagination">
                                                <ul>
                                                    <li><Link to="#" className={`link ${ongoingProductsPagination.hasPrevPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, ongoingProductsPagination.prevPage, 'ongoing')}><span className="fa fa-angle-left me-2"></span> Prev</Link></li>
                                                    {this.pagination('ongoing')}
                                                    <li><Link to="#" className={`link ${ongoingProductsPagination.hasNextPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, ongoingProductsPagination.nextPage, 'ongoing')}>Next <span className="fa fa-angle-right ms-2"></span></Link></li>
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="nav-cancelled-orders" role="tabpanel" aria-labelledby="nav-cancelled-orders-tab">
                                        {canceledProducts.length > 0 ?
                                            <table className="table table-responsive table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Product ID</th>
                                                        <th>Product<br />Name</th>
                                                        <th>Product<br />Color</th>
                                                        <th>Product<br />Size</th>
                                                        <th>Vendor’s<br />Share</th>
                                                        <th>Vendor’s<br />Name</th>
                                                        <th>Status</th>
                                                        <th colSpan="2">Mode of<br />Payment</th>
                                                        {/* <th className="invisible">action</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {canceledProducts.length && canceledProducts.map((value, index) => {
                                                        return (

                                                            <tr key={index}>
                                                                <td>{value.orderCode}</td>
                                                                <td>{value.productId.productCode}</td>
                                                                <td>{value.productId.name}</td>
                                                                <td>{value.product_sku.color}</td>
                                                                <td>{value.product_sku.size}</td>
                                                                <td>${value.paymentId.amountPaid}</td>
                                                                <td>{value.sellerId.name}</td>
                                                                <td>{value.orderStatus.orderStatusId.title}</td>
                                                                <td>{value.paymentId.paymentMode}</td>
                                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                                            </tr>

                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                            : <NotFound msg="Data not found." />
                                        }
                                        {canceledProducts.length > 0 &&
                                            <div className="pagination">
                                                <ul>
                                                    <li><Link to="#" className={`link ${canceledProductsPagination.hasPrevPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, canceledProductsPagination.prevPage, 'cancel_refund')}><span className="fa fa-angle-left me-2"></span> Prev</Link></li>
                                                    {this.pagination('cancel_refund')}
                                                    <li><Link to="#" className={`link ${canceledProductsPagination.hasNextPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, canceledProductsPagination.nextPage, 'cancel_refund')}>Next <span className="fa fa-angle-right ms-2"></span></Link></li>
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                    <div className="tab-pane fade" id="nav-completed-orders" role="tabpanel" aria-labelledby="nav-completed-orders-tab">
                                        {completedProducts.length > 0 ?
                                            <table className="table table-responsive table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Order ID</th>
                                                        <th>Product ID</th>
                                                        <th>Product<br />Name</th>
                                                        <th>Product<br />Color</th>
                                                        <th>Product<br />Size</th>
                                                        <th>Vendor’s<br />Share</th>
                                                        <th>Vendor’s<br />Name</th>
                                                        <th>Status</th>
                                                        <th colSpan="2">Mode of<br />Payment</th>
                                                        {/* <th className="invisible">action</th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {completedProducts.length && completedProducts.map((value, index) => {
                                                        return (

                                                            <tr key={index}>
                                                                <td>{value.orderCode}</td>
                                                                <td>{value.productId.productCode}</td>
                                                                <td>{value.productId.name}</td>
                                                                <td>{value.product_sku.color}</td>
                                                                <td>{value.product_sku.size}</td>
                                                                <td>${value.paymentId.amountPaid}</td>
                                                                <td>{value.sellerId.name}</td>
                                                                <td>{value.orderStatus.orderStatusId.title}</td>
                                                                <td>{value.paymentId.paymentMode}</td>
                                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                                            </tr>

                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                            : <NotFound msg="Data not found." />
                                        }
                                        {completedProducts.length > 0 &&
                                            <div className="pagination">
                                                <ul>
                                                    <li><Link to="#" className={`link ${completedProductsPagination.hasPrevPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, completedProductsPagination.prevPage, 'completed')}><span className="fa fa-angle-left me-2"></span> Prev</Link></li>
                                                    {this.pagination('completed')}
                                                    <li><Link to="#" className={`link ${completedProductsPagination.hasNextPage ? '' : 'disabled'}`} onClick={() => this.getOrders(true, completedProductsPagination.nextPage, 'completed')}>Next <span className="fa fa-angle-right ms-2"></span></Link></li>
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </React.Fragment>
        )
    }
}

export default connect(setLoading)(Orders);
