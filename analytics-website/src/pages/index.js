import * as React from "react"
import getFirebase from "./components/FirebaseInit";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, onValue, get, remove} from "firebase/database";
import Homepage from "./components/Homepage";
import Dashboard from "./components/Dashboard/Dashboard";
// import { Analytics } from "../../../analytics module/Analytics";

// markup
class IndexPage extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      uid:null,
      user: null
    }
    const app = getFirebase();
    this.user = null
    this.auth = getAuth(app);
    this.db = getDatabase(app);

    // let analytics = new Analytics("-MuuNvD3marUTYuCQRBW");
    // analytics.clicks();

    onAuthStateChanged(this.auth, user => {
      if (user){
        console.log(user);
        this.setState({
          uid: user.uid,
          user:user
        })
      }else{
        this.setState({
          uid: null,
          user: null
        })
      }
    })
    
    this.sign_in = this.sign_in.bind(this);
    this.create_user = this.create_user.bind(this);
  }

  async create_user(email, password){
    let response = await createUserWithEmailAndPassword(this.auth, email, password).then(user => {
      this.setState({
        uid: user.user.uid,
        user: user.user
      })
      let message = "success";
      let code = 200;
      return { message, code };
    }).catch(err => {
      let message = err.message;
      let code = err.code;
      return { message, code };
    })
    return response;
  }

  async sign_in(email, password){
    let response = await signInWithEmailAndPassword(this.auth, email, password).then(user => {
      this.setState({
        uid: user.user.uid,
        user: user.user
      });
      let message = "success";
      let code = 200;
      return { message, code };
    }).catch(err => {
      let message = err.message;
      let code = err.code;
      return { message, code };
    })
    return response;
  }

  sign_out(){
    signOut(this.auth);
  }

  render(){
    return (
      <main>
        <title>Analytics</title>
        {this.state.uid ?
          <Dashboard
            user={this.state.user}
            sign_out={this.sign_out}
            db = {this.db}
            auth = {this.auth}
          /> 
        :<Homepage
          sign_in={this.sign_in}
          create_user={this.create_user}
        />}
      </main>
    )
  }
 
}

export default IndexPage
