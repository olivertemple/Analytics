import React, { useState } from "react";
import "../styles/homepage.scss";
import "../styles/login.scss";
import { LineChart, Line, Tooltip, XAxis} from 'recharts';

export default function Homepage(props){
    let [err, setErr] = useState("");

    const data = [
        {name: new Date(+ new Date() -1000*60*60*24*6).toDateString(), visitors: 306},
        {name: new Date(+ new Date() -1000*60*60*24*5).toDateString(), visitors: 252},
        {name: new Date(+ new Date() -1000*60*60*24*4).toDateString(), visitors: 324},
        {name: new Date(+ new Date() -1000*60*60*24*3).toDateString(), visitors: 106},
        {name: new Date(+ new Date() -1000*60*60*24*2).toDateString(), visitors: 536},
        {name: new Date(+ new Date() - 1000*60*60*24).toDateString(), visitors: 313},
        {name: new Date().toDateString(), visitors: 741},

    ]

    const  loginUser = async () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let { message, code } = await props.sign_in(email, password);
        console.log(code);
        console.log(message);
        if (code === "auth/wrong-password"){
            setErr("Incorrect password");
        }else if (code === "auth/user-not-found"){
            setErr("User not found");
        }else if (code === "auth/invalid-email"){
            setErr("Invalid email");
        }else if (code === "auth/too-many-requests"){
            setErr("Too many failed attempts, try again later");
        }else if (message === "success"){
            if (typeof window !== undefined) {window.location.hash = ""};
        }
    }

    const signupUser = async () => {
        let email = document.getElementById("email").value;
        let password1 = document.getElementById("password1").value;
        let password2 = document.getElementById("password2").value;

        if (password1 === password2 && password1.length > 6){
            let { message, code } = await props.create_user(email, password1);
            console.log(code);
            console.log(message);
            if (code === "auth/email-already-in-use"){
                setErr("Email already in use");
            } else if (code === "auth/invalid-email"){
                setErr("Invalid email");
            } else if (code === "auth/weak-password"){
                setErr("Password is too weak, try a stronger one");
            }else if (message === "success"){
                if (typeof window !== undefined) {window.location.hash = ""};
            }
        }else{
            if (password1 !== password2){
                setErr("Passwords do not match");
            }else{
                setErr("Password must be at least 6 characters");
            }
        }


    }

    const renderPage = () => {
        return(
        <>
            <section className="hero" id="home">
                <div className="hero-content">
                    <div className="chart">
                        <LineChart width={400} height={400} data={data}>
                            <Line type="monotone" dataKey="visitors" stroke="blue" />
                            <XAxis dataKey="name" hide={true}/>
                            <Tooltip />
                        </LineChart>
                    </div>
                    <div className="title">
                        <h1>Realtime Analytics</h1>
                        <h2>Simple.</h2>
                    </div>
                </div>                        
            </section>
            <section className="about" id="about">
                <div className="about-content">
                    <h1>About</h1>
                    <div className="about-text">
                        <h2>Simple</h2>
                        <p>Analytics makes monitoring your websites as easy as adding a few lines of code. Just install the package from npm or import in a script tag and initialize the library when the site loads.</p>
                    </div>
                    <div className="about-text">
                        <h2>Versatile</h2>
                        <p>Analytics can track a wide variety of metrics, from core web vitals like LCP to number of visits and number of interactions.</p>
                    </div>
                    <div className="about-text">
                        <h2>Easy and Intuitive</h2>
                        <p>The collected data is displayed in an easy and intuitive console, available through the web, or as a mobile application (android only).</p>
                    </div>


                </div>
            </section>
            <section className="examples" id="examples">
                <div className="examples-content">
                    <h1>Examples</h1>
                </div>
            </section>
        </>
        )
    }

    const renderLogin = () => {
        return (
            <div>
                <section className="login" id="login">
                    <div className="login-content">
                        <h1>Login</h1>
                        <div className="login-form">
                            <input type="text" placeholder="Email" id="email"/>
                            <input type="password" placeholder="Password" id="password"/>
                            <p className="err" style={{display: err.length === 0 ? "none" : null}}>*{err}</p>
                            <button onClick={loginUser}>Login</button>
                        </div>
                    </div>
                </section>
            </div>
        )
    }

    const renderSignup = () => {
        return (
            <div>
                <section className="signup" id="signup">
                    <div className="signup-content">
                        <h1>Sign Up</h1>
                        <div className="signup-form">
                            <input type="text" placeholder="Email" id="email"/>
                            <input type="password" placeholder="Password" id="password1"/>
                            <input type="password" placeholder="Repeat Password" id="password2"/>
                            <p className="err" style={{display: err.length === 0 ? "none" : null}}>*{err}</p>
                            <button onClick={signupUser}>Sign Up</button>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
    return(
        <div className="homepage">
            <nav>
                <ul>
                    <li>
                        <a href="#home">Home</a>
                    </li>
                    <li>
                        <a href="#about">About</a>
                    </li>
                    <li>
                        <a href="#examples">Examples</a>
                    </li>
                </ul>
                <ul>
                    <li>
                        <a href="#login">Log In</a>
                    </li>
                    <li>
                        <a href="#signup">Sign Up</a>
                    </li>
                </ul>
            </nav>
            {typeof window !== undefined ? (window.location.hash === "#login" ? renderLogin() : window.location.hash === "#signup" ? renderSignup() : renderPage()) : null}
        </div>
    )
}