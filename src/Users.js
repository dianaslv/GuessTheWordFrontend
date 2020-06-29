import React from 'react';
import Page from './Page';
import * as signalR from '@aspnet/signalr';
import Button from "semantic-ui-react/dist/commonjs/elements/Button";


class Users extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            gameStatus: 'pending',
            hubConnection: null,
            noOfRound: 0,
            firstRoundWord: '',
            secondRoundWord: '',
            thirdRoundWord: '',
            value: 'type a word',
            firstPlayerScores: {username: '', firstRoundResult: 0, secondRoundResult: 0, thirdRoundResult: 0},
            secondPlayerScores: {username: '', firstRoundResult: 0, secondRoundResult: 0, thirdRoundResult: 0},
            thirdPlayerScores: {username: '', firstRoundResult: 0, secondRoundResult: 0, thirdRoundResult: 0}
        };
        this.incrementPage = this.incrementPage.bind(this);
        this.decrementPage = this.decrementPage.bind(this);
        this.setPage = this.setPage.bind(this);
        this.handleStartGameButton = this.handleStartGameButton.bind(this);
        this.getNumberOfPlayers = this.getNumberOfPlayers.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentDidMount() {
        const {match: {params}} = this.props;
        this.setState({username: params.username});


        this.setState({}, () => {
            this.state.hubConnection = new signalR.HubConnectionBuilder()
                .withUrl('http://localhost:5000/hub', {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .build();


            this.state.hubConnection.start().then(() => console.log("connected")).catch(err => console.log(err));
            this.getNumberOfPlayers();


            this.state.hubConnection.on("getStatusGame", (gameStatus, roundNo, category) => {
                console.log(gameStatus);
                if (gameStatus === 'gameStarted') {
                    console.log('gameStarted');
                    if (roundNo === 1) this.setState({gameStatus: gameStatus, noOfRound: 1, firstRoundWord: category});
                    if (roundNo === 2) this.setState({gameStatus: gameStatus, noOfRound: 2, secondRoundWord: category});
                    if (roundNo === 3) this.setState({gameStatus: gameStatus, noOfRound: 3, thirdRoundWord: category});
                }
                if (gameStatus === 'gameOver') {
                    this.setState({gameStatus: 'gameOver'});
                }
            });


            this.state.hubConnection.on("getNumberOfPlayers", (noOfPlayers) => {
                console.log(noOfPlayers);
                if (noOfPlayers < 3) {
                    console.log('pending');
                    this.setState({gameStatus: 'pending'});
                } else {
                    this.setState({gameStatus: 'gameStarted'});
                }
            });


            this.state.hubConnection.on("setStudentsUsernames", (usernames) => {
                this.setState({
                    firstPlayerScores: {username: usernames[0]},
                    secondPlayerScores: {username: usernames[1]},
                    thirdPlayerScores: {username: usernames[2]}
                });
            });

            this.state.hubConnection.on("setScoreForResponse", (username, score) => {

                if (this.state.firstPlayerScores.username === username) {
                    if (this.state.noOfRound === 1) {
                        this.setState({
                            firstPlayerScores: {firstRoundResult: score}
                        });
                    }
                    if (this.state.noOfRound === 2) {
                        this.setState({
                            firstPlayerScores: {secondRoundResult: score}
                        });
                    }
                    if (this.state.noOfRound === 3) {
                        this.setState({
                            firstPlayerScores: {thirdRoundResult: score}
                        });
                    }
                }
                if (this.state.secondPlayerScores.username === username) {
                    if (this.state.noOfRound === 1) {
                        this.setState({
                            secondPlayerScores: {username: username, firstRoundResult: score}
                        });
                    }
                    if (this.state.noOfRound === 2) {
                        this.setState({
                            secondPlayerScores: {username: username, secondRoundResult: score}
                        });
                    }
                    if (this.state.noOfRound === 3) {
                        this.setState({
                            secondPlayerScores: {username: username, thirdRoundResult: score}
                        });
                    }
                }
                if (this.state.thirdPlayerScores.username === username) {
                    if (this.state.noOfRound === 1) {
                        this.setState({
                            thirdPlayerScores: {username: username, firstRoundResult: score}
                        });
                    }
                    if (this.state.noOfRound === 2) {
                        this.setState({
                            thirdPlayerScores: {username: username, secondRoundResult: score}
                        });
                    }
                    if (this.state.noOfRound === 3) {
                        this.setState({
                            thirdPlayerScores: {username: username, thirdRoundResult: score}
                        });
                    }
                }

            });
        });

    }


    componentWillReceiveProps({location = {}}) {
        if (location.pathname === '/exam' && location.pathname !== this.props.location.pathname) {
            console.log("hi");
        }
    }

    setPage(page) {
        return () => {
            this.setState({page});
        };
    }

    decrementPage() {
        const {page} = this.state;

        this.setState({page: page - 1});
    }

    incrementPage() {
        const {page} = this.state;

        this.setState({page: page + 1});
    }

    handleStartGameButton() {
        const {username} = this.state;
        this.state.hubConnection
            .invoke('Start', username)
            .catch(err => console.error(err));

        this.setState({message: ''});
    }

    getNumberOfPlayers() {
        this.state.hubConnection
            .invoke('GetNumberOfPlayers')
            .catch(err => console.error(err));

        this.setState({message: ''});
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('Text submitted: ' + this.state.value);
        event.preventDefault();

        this.state.hubConnection
            .invoke('SetAnswerForPlayer', this.state.username, this.state.noOfRound, this.state.value)
            .catch(err => console.error(err));

        this.setState({message: ''});
    }


    render() {
        const {gameStatus, noOfRound, firstRoundWord, secondRoundWord, thirdRoundWord} = this.state;

        return (
            <Page title="">
                <div>
                    {gameStatus !== 'gameStarted' ?
                        (
                            <Button onClick={this.handleStartGameButton}>START GAME</Button>
                        )
                        :
                        (
                            <div>
                                <h2>Received category: {noOfRound}, {firstRoundWord}</h2>
                                <form onSubmit={this.handleSubmit}>
                                    <label>
                                        Introduce word...:
                                        <textarea value={this.state.value} onChange={this.handleChange}/>
                                    </label>
                                    <input type="submit" value="Submit"/>
                                </form>
                                <h3>Round 1:</h3>
                                <h4>{this.state.firstPlayerScores.username} : {this.state.firstPlayerScores.firstRoundResult};</h4>
                                <br/>
                                <h4>  {this.state.secondPlayerScores.username} : {this.state.secondPlayerScores.firstRoundResult};</h4>
                                <br/>
                                <h4>  {this.state.thirdPlayerScores.username} : {this.state.thirdPlayerScores.firstRoundResult};</h4>
                                <br/>

                                <h3>Round 2:</h3>
                                <h4>  {this.state.firstPlayerScores.username} : {this.state.firstPlayerScores.secondRoundResult};</h4>
                                <br/>
                                <h4>  {this.state.secondPlayerScores.username} : {this.state.secondPlayerScores.secondRoundResult};</h4>
                                <br/>
                                <h4>  {this.state.thirdPlayerScores.username} : {this.state.thirdPlayerScores.secondRoundResult};</h4>
                                <br/>


                                <h3>Round 3:</h3>
                                <h4>  {this.state.firstPlayerScores.username} : {this.state.firstPlayerScores.thirdRoundResult};</h4>
                                <br/>
                                <h4>  {this.state.secondPlayerScores.username} : {this.state.secondPlayerScores.thirdRoundResult};</h4>
                                <br/>
                                <h4>  {this.state.thirdPlayerScores.username} : {this.state.thirdPlayerScores.thirdRoundResult};</h4>
                                <br/>
                            </div>
                        )
                    }
                    {gameStatus === 'gameOver' ?
                        (
                            <div>
                                <h3>Player 1:</h3>
                                <h4>{this.state.firstPlayerScores.username} : {this.state.firstPlayerScores.firstRoundResult+this.state.firstPlayerScores.secondRoundResult+this.state.firstPlayerScores.thirdRoundResult};</h4>
                                <br/>

                                <h3>Player 2:</h3>
                                <h4>  {this.state.firstPlayerScores.username} : {this.state.firstPlayerScores.secondRoundResult};</h4>
                                <br/>


                                <h3>Player 3:</h3>
                                <h4>  {this.state.firstPlayerScores.username} : {this.state.firstPlayerScores.thirdRoundResult};</h4>
                                <br/>
                            </div>
                        )
                        :
                        (<h4>Game not over yet</h4>)}

                </div>
            </Page>
        );
    }


}

export default Users;
