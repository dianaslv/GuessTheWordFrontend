import React from 'react';
import {Grid, Form, Header, Message} from 'semantic-ui-react';
import {Helmet} from 'react-helmet';
import store from 'store';
import {Link} from 'react-router-dom';
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Page from "./Page";
import axios, {get} from "axios";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            error: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e) {
        e.preventDefault();
        const {username, password} = this.state;

        this.setState({error: false});
        const user = {
            "Username": username,
            "Password": password
        }

        axios.post('http://localhost:5000/Student/login', user)
            .then(({ data:u }) => {
                console.log(username);
                const response = u["item2"];
                console.log(response);
                const { history } = this.props;
                history.push(`/exam/${username}`);
            })
            .catch(e => {return this.setState({ error: true })});

        console.log("you're logged in. yay!");
        store.set('loggedIn', true);
    }

    handleChange(e, {name, value}) {
        this.setState({[name]: value});
    }

    render() {
        const {error} = this.state;

        return (
            <Page title="">
                <Grid>
                    <Helmet>
                        <title>Login</title>
                    </Helmet>

                    <Grid.Column width={6}/>
                    <Grid.Column width={4}>
                        <Form  error={error} onSubmit={this.onSubmit}>
                            <Header as="h1">Login</Header>
                            {error && <Message
                                error={error}
                                content="The username/password is incorrect."
                            />}
                            <Form.Input
                                inline
                                label="Username"
                                name="username"
                                onChange={this.handleChange}
                            />
                            <Form.Input
                                inline
                                label="Password"
                                type="password"
                                name="password"
                                onChange={this.handleChange}
                            />
                            <Form.Button type="submit">Go!</Form.Button>
                        </Form>
                    </Grid.Column>
                </Grid>

            </Page>
        );
    }
}

export default Login;
