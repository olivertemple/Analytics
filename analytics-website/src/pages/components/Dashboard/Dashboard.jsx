import React from "react";
import { getDatabase, ref, set, push, onValue, get, remove} from "firebase/database";
import "../../styles/Dashboard.scss";
import ProjectList from "./ProjectList";
import Project from "./Project";
import { GrProjects } from "react-icons/gr";
import { FiSettings } from "react-icons/fi";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { AiOutlineSearch, AiOutlineMenu } from "react-icons/ai";

export default class Dashboard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            projects: [],
            name: "",
            createNew:false,
            newProjectKey: null,
            newProjectName: "",
            newProjectUrl: "",
            activeProject: null,
            screen: "projects",
            menu: false,
            search: "",
        }

        this.createNewProject = this.createNewProject.bind(this);
        this.startCreateNewProject = this.startCreateNewProject.bind(this);
        this.setActiveProject = this.setActiveProject.bind(this);
        this.showMenu = this.showMenu.bind(this);
    }

    componentDidMount(){
        this.get_user_data();
    }

    async get_user_data(){
        onValue(ref(this.props.db, `users/${this.props.user.uid}`), async snap => {
            if (snap.exists()){
                let user_data = snap.val();
                let projects_ids = Object.values(user_data.projects);
                let projects = [];
                await Promise.all(projects_ids.map(async project_id => {
                    let project_data = await get(ref(this.props.db, `projects/${project_id}`));
                    if (project_data.exists()){
                        project_data = project_data.val();
                        project_data.id_code = project_id;
                        projects.push(project_data);
                    }else{
                        console.log(project_data)
                    }
                }))
                console.log(projects);
                this.setState({projects:projects});
                this.setState({name:user_data.name});
            }
        });
    }

    startCreateNewProject(){
        this.setState({
            createNew:true
        });

    }

    createNewProject(){
        push(ref(this.props.db, `projects/`), {
            name: this.state.newProjectName,
            url: this.state.newProjectUrl,
        }).then(res => {
            let key = res.key;

            push(ref(this.props.db, `users/${this.props.user.uid}/projects/`), key)
            this.setState({
                createNew:false,
            })
        })

    }

    renderNewProject(){
        return(
            <div className="project-card">
                <div className="project-cart-header">
                    <h3>Create new project</h3>
                    <input type="text" placeholder="Project name" className="new-project-name" onChange={(e) => {this.setState({newProjectName:e.target.value})}}/>
                    <input type="text" placeholder="Website url" className="new-project-url" onChange={(e) => {this.setState({newProjectUrl:e.target.value})}}/>
                </div>
                <div className="project-card-content">
                    <button onClick={this.createNewProject}>Create</button>
                </div>
            </div>
        )
    }

    setActiveProject(index){
        this.setState({activeProject:this.state.projects[index]})
    }

    showMenu(){
        this.setState({
            menu:true
        })
    }

    renderMainContent(){
        if (this.state.screen === "projects"){
            return (
                <div className="projects">
                     <div className="search-bar">
                            <AiOutlineMenu size={20} className="menu" onClick={this.showMenu}/>
                            <AiOutlineSearch size={20}/>
                            <input type="text" placeholder="Search..." value={this.state.search} onChange={(e) => {this.setState({search:e.target.value}); this.setActiveProject(null)}}/>
                        </div>
                    <div className="projects-list">
                        {this.state.activeProject ?
                             <Project
                                 project={this.state.activeProject}
                                 back={() => {this.setActiveProject(null)}}
                             /> 
                         :
                            <>
                                <ProjectList
                                    projects={this.state.projects}
                                    search={this.state.search}
                                    setActiveProject={this.setActiveProject}
                                />
                                 {this.state.createNew ? this.renderNewProject() : null}
                                <button onClick={!this.state.createNew ? this.startCreateNewProject : (() => {
                                    this.setState({createNew:false})
                                })}>{!this.state.createNew ? "Create new project" : "Cancel"}</button>
                            </>
                        }
                    </div> 
                </div>
            )
        }else{
            return null
        }
    }

    render(){
        return(
            <section className="Dashboard">
                <div className="content">
                    <nav className="side-nav" style={{transform: this.state.menu ? null : "translateX(-100%)"}}>
                        <div className="side-nav-header">
                            <AiOutlineCloseCircle className="close" size={20} onClick={() => {this.setState({menu:false})}}/>
                            <div className="side-nav-title">
                                <h3>Welcome back {this.state.name}</h3>
                                <button className="logout" onClick={this.props.logout}>Logout</button>
                            </div>
                            
                        </div>
                        <div className="side-nav-items">
                            <div className={`side-nav-item ${this.state.screen === "projects" ? "active" : null}`} onClick={() => {this.setState({screen:"projects"})}}>
                                <GrProjects/>
                                <h3>Projects</h3>
                            </div> 
                            <div className="side-nav-item" className={`side-nav-item ${this.state.screen === "settings" ? "active" : null}`} onClick={() => {this.setState({screen:"settings"})}}>
                                <FiSettings/>
                                <h3>Settings</h3>
                            </div>  
                        </div>
                    </nav>
                    {this.renderMainContent()}
                </div>
            </section>
        )
    }
}