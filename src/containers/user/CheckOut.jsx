import React, { Component, useRef } from "react";
import Header from "../../components/user/common/Header";
import PageTitle from "../../components/user/common/PageTitle";
import Footer from "../../components/common/Footer";
import { connect } from "react-redux";
import axios from "axios";
import { Box, Text } from "rebass";
import styled from "styled-components";
import { toast } from 'react-toastify';
import store from '../../store/index';
import { useHistory } from "react-router-dom";
//coinbase inport
//import CoinbaseCommerceButton from "react-coinbase-commerce";
//import 'react-coinbase-commerce/dist/coinbase-commerce-button.css';
import { FormComponent, FormContainer } from "react-authorize-net";

//let clientKey = process.env.REACT_APP_AUTHORIZENET_CLIENTKEY as string;
//let clientKey;
//let apiLoginId = process.env.REACT_APP_AUTHORIZENET_LOGINID as string;
//let apiLoginId;
/*
type State = {
    status: "paid" | "unpaid" | ["failure", string[]];
};*/
const Button = styled.button({
    "&:hover": { cursor: "pointer" },
    padding: "10px",
    backgroundColor: "white",
    border: "2px solid black",
    fontWeight: 600,
    borderRadius: "2px"
  });
  
  const ErrorComponent = (props: {
    errors: [];
    onBackButtonClick: () => void;
  }) => (
    <div>
      <Text fontSize={3} fontWeight={"500"} mb={3}>
        Failed to process payment
      </Text>
      {props.errors.map(error => (
        <Text py={2}>{error}</Text>
      ))}
      <Button onClick={props.onBackButtonClick}>Go Back</Button>
    </div>
  );
 
  /*
  const Header = props => (
    <Flex py={4}>
      <Heading>react-authorize-net-example</Heading>
    </Flex>
  );*/

class CheckOut extends Component {
    
    constructor(props) {
        super(props);
        this.buttonRef = React.createRef;
        this.clientKey = "3q47VR4QY739gdggD4dP2JJsUNyd54bJJdDDpAdmktL59dA96SZMARZHtG2tDz6V";
        this.apiLoginId = "7e44GKHmR3b";
        this.authInfo = store.getState().auth.authInfo;
        this.state = {
            formStatus: false,
            chargeData: '',
            checkoutData: '',
            apiData: [],
            statusData: [],
            //status: "paid" | "unpaid" | ["failure", []],
            status: "unpaid",
            data: [],
            reqBody: {
                count: {
                    page: 1,
                    skip: 0,
                    limit: 2,
                    data: ''
                },
                sorting: {
                    sort_type: "date",
                    sort_val: "desc"
                }
            },
            autherStatus: '',
            user_id: '',
            paymentType: '',
            moneyComparision: false
        };
    }
    onErrorHandler = (response) => {
        console.log(response);
            this.setState({
                status: ["failure", response.messages.message.map(err => err.text)]
            });
        
    };
    onSuccessHandler = (response) => {
        console.log(response);
        console.log(response.messages.resultCode);
        if(response.messages.resultCode === "Ok") {
            this.setState({ status: ["paid", []] });
            toast.dismiss();
            toast.success('Payment Successfull', {autoClose: 3000});
            //window.location.href('/OrderDetail')
        }
        // Process API response on your backend...
        
    };
    componentDidMount() {
        this.getNewCouponCode();
        //document.getElementsByClassName("sc-htpNat")[0].style.display = "none";
        //document.getElementsByClassName("sc-htpNat")[0].closest("div").style.display = "none"; 
    }
    
    //get new Coupon code
    getNewCouponCode = () => {
        let reqBody = this.state.reqBody
        axios.post('user/coupons/new', reqBody, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': `Bearer ${this.authInfo.token}`,
            }
        }).then((response) => {
            this.setState({ data: response.data.data.coupons })
            console.log(response.data.data.coupons)
        }).catch(error => {
            console.log(error)
        });
    }   //get new Coupon code
    
    onSubmitHandler = event => {
        event.preventDefault();
        if(this.state.status[0] === "paid") {
            let reqBody = this.state.reqBody
            axios.post('user/saveorder', reqBody, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Authorization': `Bearer ${this.authInfo.token}`,
                }
            }).then((response) => {
                this.setState({ data: response.data.data.order })
                console.log(response.data.data.order)
            }).catch(error => {
                console.log(error)
            });
        }
    }
    onChange(field, value) {
        // parent class change handler is always called with field name and value
        this.setState({[field]: value});
    }
    render() {
        const cart = this.props.cart
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const fullname = userInfo.name;
        const [first, last] = fullname.split(' ');
        const { history } = this.props;
        

        // submit Function
        this.onSubmit = () => {
            let disCode = document.getElementById('myCoupon').value
            console.log(disCode)
            //this.setState({ couponCode: disCode })
            let reqBody = {}
            let user = this.authInfo.id
            reqBody = {
                count: {
                    page: 1,
                    skip: 0,
                    limit: 2,
                    data: '',
                },
                sorting: {
                    sort_type: "date",
                    sort_val: "desc"
                },
                data: disCode,
                user_id: user
            }

            if (disCode === '') {
                toast.error('Coupon code is blank')
            } else {
                //check isActive is true
                axios.post('user/coupons/check', reqBody, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Authorization': `Bearer ${this.authInfo.token}`,
                    }
                }).then((response) => {
                    this.setState({ apiData: response.data.data.coupons })

                }).catch(error => {
                    console.log(error)
                    toast.error('This code is already used or code is not match')
                });//check isActive is true
            }
        }    //onSubmit() 

        
        const getTotal = () => {

            const newDesApi = this.state.apiData;
            var newDiscount = ''
            newDesApi.forEach(val => {
                newDiscount = val.discount_per
            })
            let totalQuantity = 0
            let disCode = newDiscount
            let totalPrice = 0
            let GST = 18
            let totalAmmount = 0
            let discount = 0
            let tax = 0
            cart.forEach(items => {
                totalQuantity += items.quantity
                totalPrice += items.price * items.quantity
                tax = totalPrice * GST / 100
                //totalAmmount = totalPrice + tax
                if (disCode === undefined) {
                    discount = 0
                    totalAmmount = totalPrice + tax
                } else {
                    discount = totalPrice * disCode / 100
                    totalAmmount = totalPrice + tax - discount
                }
            })
            return { totalPrice, totalQuantity, totalAmmount, discount, tax }
        }//getTotal();

        this.onValueChange = (event) => {
            this.setState({
                paymentType: event.target.value
            });

            if (this.state.paymentType === 'cripto') {
                this.setState({ moneyComparision: false })
                this.setState({ formStatus: false })
            }
        }
        
        return (
            <React.Fragment>
                <Header />
                <PageTitle title="CheckOut" />
                <section className="inr_wrap checkout_wrap">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="cart my_cart">
                                    <div className="cart_wrap">
                                        <div className="items_incart">
                                            <span>have a coupons <a href="/">Click here to have</a></span>
                                        </div>
                                        <div className="cart_wrap">
                                            <div className="checkout_cart_wrap">
                                                <p>IF YOU HAVE A COUPON CODE,PLEASE APPLY IT BELOW </p>
                                                <div className="input-group d-flex">
                                                    <input type="text" className="form-control" placeholder="Enter your coupons code" aria-label="Example text with button addon"
                                                        id="myCoupon"
                                                    />
                                                    <button className="btn custom_btn btn_yellow" type="button" onClick={this.onSubmit} > Apply coupns code</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div style={{ "padding": "0px 0px 0px 25px" }} className="checkout_form_section">
                                                <div className="items_incart">
                                                    <h4>BILLING DETAILS</h4>
                                                </div>
                                                <div className="checkout-form">
                                                    <form id="frmCheckoutHandle" onSubmit={this.onSubmitHandler}>
                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field">
                                                                    <label htmlFor="">First Name <span>*</span></label>
                                                                    <input type="text" className="form-control" value={first} onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                            <div className="input-group ">
                                                                <div className="form_field">
                                                                    <label htmlFor="">Last Name<span>*</span></label>
                                                                    <input type="text" className="form-control" value={last} onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Company Name(optional)</label>
                                                                    <input type="text" className="form-control" onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Country/Region<span>*</span></label>
                                                                    <div className="dropdown">
                                                                        <button className="dropdown-toggle form-control text-left" type="button" data-toggle="dropdown">United kingdom
                                                                            <span className="caret"></span>
                                                                        </button>
                                                                        <ul className="dropdown-menu">
                                                                            <li><a href="/">US</a></li>
                                                                            <li><a href="/">India</a></li>
                                                                            <li><a href="/">India</a></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Street Address <span>*</span></label>
                                                                    <input className="form-control" type="text" placeholder="House number and street number" style={{ "marginBottom": "15px" }} onChange={this.onChange.bind(this)}/><br />
                                                                    <input className="form-control" type="text" placeholder="House number" onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Town/City<span>*</span></label>
                                                                    <input type="text" className="form-control" onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Country(Optional)</label>
                                                                    <input type="text" className="form-control" onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Postcode<span>*</span></label>
                                                                    <input type="number" className="form-control" onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Phone<span>*</span></label>
                                                                    <input type="tel" className="form-control" name="" onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Email<span>*</span></label>
                                                                    <input type="email" className="form-control" value={userInfo.email} onChange={this.onChange.bind(this)}/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="checkout_form_wrapper">
                                                            <div className="input-group ">
                                                                <div className="form_field" style={{ width: '76%' }}>
                                                                    <label htmlFor="">Note<span>*</span></label>
                                                                    <textarea name="" className="form-control" placeholder="Note about your oder" id="" cols="30" rows="10" onChange={this.onChange.bind(this)}></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button id="frmcheckout" type="submit">Place Order</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="payment_method_section">
                                                <div className="payment_list">
                                                    <ul>
                                                        <li>Price({getTotal().totalQuantity}) : {getTotal().totalPrice}$ </li>
                                                        <li>Tax(18%) : {getTotal().tax}$ </li>
                                                        <li>Discount : {getTotal().discount}$ </li>
                                                        <li>Delivery Charges: 0$ </li>
                                                    </ul>
                                                </div>
                                                <div className="subtotal_wrapper">
                                                    <ul>
                                                        <li>Subtotal  : {getTotal().totalAmmount}$</li>
                                                    </ul>
                                                </div>

                                                <div className="payment_method_wrapper">
                                                    {/*<b>Select any option for Payment </b>*/}
                                                    <ul>
                                                        <li className="payment_list">
                                                            <div className="">
                                                                {/*<input
                                                                    type="radio"
                                                                    id=""
                                                                    name="payment"
                                                                    value="authorize_net"
                                                                    checked={this.state.paymentType === "authorize_net"}
                                                                    onChange={this.onValueChange}
                                                                />*/}
                                                                <span>Pay Now</span>
                                                            </div>

                                                            {/* <div className="dropdown">
                                                                <button className=" dropdown-toggle" type="button" data-toggle="dropdown">Select Payment Method
                                                                    <span className="caret"></span></button>
                                                                <ul className="dropdown-menu">
                                                                    <li><a href="#">Visa</a></li>
                                                                    <li><a href="#">Bank to bank</a></li>
                                                                    <li><a href="#">Paypal</a></li>
                                                                </ul>
                                                            </div> */}

                                                        </li>
                                                    </ul>
                                                    
                                                </div>
                                                <div className="">
                                                    
                                                    <Box className="App" p={3}>
                                                            {this.state.status[0] === "paid" ? (
                                                            <Text fontWeight={"500"} fontSize={3} mb={4}>
                                                                Thank you for your payment!
                                                            </Text>
                                                            ) : this.state.status === "unpaid" ? (
                                                            <FormContainer
                                                                environment="sandbox"
                                                                onError={this.onErrorHandler}
                                                                onSuccess={this.onSuccessHandler}
                                                                amount={getTotal().totalAmmount}
                                                                component={FormComponent}
                                                                clientKey={this.clientKey}
                                                                apiLoginId={this.apiLoginId}
                                                            />
                                                            ) : this.state.status[0] === "failure" ? (
                                                            <ErrorComponent
                                                                onBackButtonClick={() => this.setState({ status: "unpaid" })}
                                                                errors={this.state.status[1]}
                                                            />
                                                            ) : null}
                                                        </Box>
                                                    {/* <a className="btn custom_btn btn_yellow" >Place Order</a> */}
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
                <Footer />
            </React.Fragment>
        )
    }
}
//export default CheckOut;
const mapStateToProps = state => {
    return {
        cart: state.cart.cart
    }
}

export default connect(mapStateToProps)(CheckOut);