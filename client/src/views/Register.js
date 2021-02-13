import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {
    Form,
    Input,
    Tooltip, Breadcrumb, Row, Card, Button
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { isAuth } from '../helpers/auth'
import { Redirect } from 'react-router-dom'

const Register = () => {
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        password: "",
        password2: ""
    })
    const [form] = Form.useForm();
    const formLayout = 'vertical'


    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },

        },
    };


    const { email, name, password, password2 } = formData

    const handleChange = key => e => {
        setFormData({ ...formData, [key]: e.target.value })

    }

    const handleSubmit = () => {

        if (name && email && password) {
            if (password !== password2) {
                toast.error("passwords don't match");
            } else {
                axios.post(`${process.env.REACT_APP_URL}/api/register`, {
                    name, email, password
                }).then(res => {
                    setFormData({
                        ...formData,
                        name: "",
                        email: "",
                        password: "",
                        password2: ""
                    })

                    toast.success(res.data.message)
                }).catch(err => {
                    toast.error(err.response.data.error)
                })

            }
        } else {
            toast.error('Fill all fields')
        }
    }
    if (isAuth()) {
        <Redirect to='/' />
    }
    return (
        <>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>Register</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-content">
                <Row justify="center" align="middle"  >
                    <div className="ant-col ant-col-xs-24 ant-col-xl-8">
                        <Card>
                            <Form
                                layout='vertical'
                                form={form}
                                name="register"
                                onFinish={handleSubmit}
                                scrollToFirstError
                            >
                                <Form.Item
                                    name="name"
                                    onChange={handleChange('name')}
                                    label={
                                        <span>
                                            Username&nbsp;
            <Tooltip title="What do you want others to call you?">
                                                <QuestionCircleOutlined />
                                            </Tooltip>
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your username!',
                                            whitespace: true,
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="E-mail"
                                    onChange={handleChange('email')}
                                    rules={[
                                        {
                                            type: 'email',
                                            message: 'The input is not valid E-mail!',
                                        },
                                        {
                                            required: true,
                                            message: 'Please input your E-mail!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label="Password"
                                    onChange={handleChange('password')}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your password!',
                                        },
                                    ]}
                                    hasFeedback
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item
                                    name="confirm"
                                    label="Confirm Password"
                                    onChange={handleChange('password2')}
                                    dependencies={['password']}
                                    hasFeedback
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please confirm your password!',
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }

                                                return Promise.reject('The two passwords that you entered do not match!');
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item {...tailFormItemLayout}>
                                    <Button type="primary" htmlType="submit">
                                        Register
        </Button>
                                </Form.Item>

                            </Form>

                        </Card>
                    </div>
                </Row>
            </div>
        </>
    )
}

export default Register