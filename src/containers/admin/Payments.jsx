import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/admin/common/Header';
import { toast } from 'react-toastify';
import { setLoading } from '../../store/reducers/global-reducer';
import { connect } from 'react-redux';
import store from '../../store/index';
import axios from 'axios';
import Footer from '../../components/common/Footer';
import SpinnerLoader from '../../components/common/SpinnerLoader';

class AdminPayments extends Component {
    constructor(props){
        super(props);
        const {dispatch} = props;
        this.dispatch = dispatch;
        this.authInfo = store.getState().auth.authInfo;
        this.state={
            data:[],
        }
    }
    getPayments=()=>{
        let reqBody = {
            count: {
                page: 1,
                skip: 0,
                limit: 2
            },
            sorting: {
                sort_type: "date",
                sort_val: "desc"
            }
        };
        let url = 'admin/payments';
        this.dispatch(setLoading({ loading: true }));
        axios.post(url, reqBody, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': `Bearer ${this.authInfo.token}`
            }
        }).then((response) => {
            if (response.data.status) {
                // this.setState({

                //     data: response.data.data.coupons,
                //     pagination: response.data.data.paginationData
                // });
                console.log(response);                
            }

        }).catch(error => {
            if (error.response && error.response.data.status === false) {
                toast.error(error.response.data.message);
                
                
            }
        }).finally(() => {
            console.log('insdide finally');
            setTimeout(() => {
                this.dispatch(setLoading({ loading: false }));
            }, 300);
        });
    }
    componentDidMount() {
        var element = document.getElementsByTagName("BODY")[0]
        element.style.overflow = 'unset';       
        
        this.getPayments();
    }

    render() {
        const { loading } = store.getState().global
        return (
            <React.Fragment>
                {loading === true ? <SpinnerLoader /> : ''}
                <Header />
                <div className="seller_dash_wrap pt-5 pb-5">
                    <div className="container ">
                        <div className="bg-white rounded-3 pt-3 pb-5">
                            <div className="dash_inner_wrap">
                                <div className="col-md-12 pt-2 pb-3 d-flex justify-content-between align-items-center">
                                    <div className="dash_title">Payments</div>
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
                                                                <option>Status</option>
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
                                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                    <button className="nav-link active" id="nav-pending-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-pending-orders" type="button" role="tab" aria-controls="nav-pending-orders" aria-selected="true">Pending Payments</button>
                                    <button className="nav-link" id="nav-ongoing-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-ongoing-orders" type="button" role="tab" aria-controls="nav-ongoing-orders" aria-selected="false">Successful Payments</button>
                                    <button className="nav-link" id="nav-cancelled-orders-tab" data-bs-toggle="tab" data-bs-target="#nav-cancelled-orders" type="button" role="tab" aria-controls="nav-cancelled-orders" aria-selected="true">Cancelled Payments</button>
                                </div>
                            </nav>
                            <div className="orders_table tab-content pt-0 pb-0" id="nav-tabContent">
                                <div className="tab-pane fade show active" id="nav-pending-orders" role="tabpanel" aria-labelledby="nav-pending-orders-tab">
                                    <table className="table table-responsive table-bordered">
                                        <thead>
                                            <tr>
                                                <th>S.No.</th>
                                                <th>Payment ID</th>
                                                <th>Order ID</th>
                                                <th>Product ID</th>
                                                <th>Product<br />Name</th>
                                                <th>Status</th>
                                                <th>Mode of <br />Payment</th>
                                                <th className="invisible">action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>ABC2344</td>
                                                <td>00189</td>
                                                <td>EBC2344</td>
                                                <td>Roadster Jeans</td>
                                                <td>Delivered</td>
                                                <td>COD</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td>ABC2344</td>
                                                <td>00189</td>
                                                <td>EBC2344</td>
                                                <td>Roadster Jeans</td>
                                                <td>Delivered</td>
                                                <td>COD</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td>ABC2344</td>
                                                <td>00189</td>
                                                <td>EBC2344</td>
                                                <td>Roadster Jeans</td>
                                                <td>Delivered</td>
                                                <td>COD</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>4</td>
                                                <td>ABC2344</td>
                                                <td>00189</td>
                                                <td>EBC2344</td>
                                                <td>Roadster Jeans</td>
                                                <td>Delivered</td>
                                                <td>COD</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="tab-pane fade" id="nav-ongoing-orders" role="tabpanel" aria-labelledby="nav-ongoing-orders-tab">
                                    <table className="table table-responsive table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Product ID</th>
                                                <th>Product Name</th>
                                                <th>Brand</th>
                                                <th>Category</th>
                                                <th>Total Stock quantity</th>
                                                <th>Status</th>
                                                <th className="invisible">action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Pending</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Pending</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Pending</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Pending</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Pending</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Pending</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="tab-pane fade" id="nav-cancelled-orders" role="tabpanel" aria-labelledby="nav-cancelled-orders-tab">
                                    <table className="table table-responsive table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Product ID</th>
                                                <th>Product Name</th>
                                                <th>Brand</th>
                                                <th>Category</th>
                                                <th>Total Stock quantity</th>
                                                <th>Status</th>
                                                <th className="invisible">action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Rejected</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Rejected</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Rejected</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Rejected</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Rejected</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                            <tr>
                                                <td>QE123311</td>
                                                <td>Roadster Jeans</td>
                                                <td>Roadster</td>
                                                <td>Cloths</td>
                                                <td>255</td>
                                                <td>Rejected</td>
                                                <td><Link to="#" className="custom_btn btn_yellow_bordered w-auto btn">Details</Link></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </React.Fragment >

        );
    }
}

export default connect(setLoading)(AdminPayments);
