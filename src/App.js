import React, {
  Component
} from 'react';
import './App.css';
import base64 from 'base-64';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.loadPreviousData = this.loadPreviousData.bind(this);
    this.loadNextData = this.loadNextData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      dataAll: [],
      url:'http://localhost:8080/ticketList?per_page=25&page=1',
      username:'',
      password:'',
      value:''
    }
  }

  loadData() {
    let request = new Request(this.state.url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + base64.encode(this.state.username + ':' + this.state.password),
      },
      mode: 'cors'
    });
    fetch(request)
      .then((resp) => resp.json())
      .then(data => {
        if(Array.isArray(data.tickets) && data.tickets.length !== 0){
          this.setState({
            dataAll: data.tickets
          });
        }else if(data.meta.code === 401){
          throw new Error(data.meta.msg); 
        }
        else if(data.meta.code === 400){
          throw new Error("No More Data");
        }
        
      })
      .catch(function (error) {
        alert(error);
      })
  }
  loadPreviousData(){
    let s = this.state.url;
    let curr_page = parseInt(s.substr(s.indexOf('&page=') + 6, s.length-1));
    let prev = curr_page - 1;
    if(curr_page > 1){
      s = s.substr(0, s.indexOf('&page=')+6) + prev;
      this.setState({url:s},()=>{
        this.loadData();
      });
    }
  }
  loadNextData(){
    let s = this.state.url;
    let curr_page = parseInt(s.substr(s.indexOf('&page=') + 6, s.length-1));
    let next = curr_page + 1;
    s = s.substr(0, s.indexOf('&page=')+6) + next;
    this.setState({url:s},()=>{
      this.loadData();
    });
  }
  handleChange(event) {
    let property = event.target.name;
    this.setState({[property]: event.target.value});
  }
  handleSubmit(event){
    this.loadData();
    event.preventDefault();
  }
  render() {
    const ticks = this.state.dataAll;
    const listItems = ticks.map((t) =>{
      let create = new Date(t.created_at);
      create = create.toDateString();
      let update = new Date(t.created_at);
      update = update.toDateString();
      return <li key={t.id}>ID: {t.id}<br/>Status: {t.status}<br/>Description: {t.description}<br/>Created At: {create}<br/>Last Updated At: {update}</li>}
    );
    return (
      
      <div>
        {this.state.dataAll.length != 0
          ? <div><button onClick={this.loadPreviousData}>Previous</button><ul>{listItems}</ul><button onClick={this.loadNextData}>Next</button></div>
          : <form onSubmit={this.handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" value={this.state.username} onChange={this.handleChange} />
          </label>
          <label>
            Password:
            <input type="password" name="password" value={this.state.password} onChange={this.handleChange}/>
          </label>
          <input type="submit" value="Submit" />
        </form>}
        
      </div>
    );
  }
}