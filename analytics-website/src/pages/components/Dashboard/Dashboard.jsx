import React from "react";
import { getDatabase, ref, set, push, onValue, get, remove} from "firebase/database";
import "../../styles/Dashboard.scss";
import ProjectList from "./ProjectList";
import Project from "./Project";

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
        }

        this.createNewProject = this.createNewProject.bind(this);
        this.startCreateNewProject = this.startCreateNewProject.bind(this);
        this.setActiveProject = this.setActiveProject.bind(this);
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
                    <button className="create-new-project" onClick={this.createNewProject}>Create</button>
                </div>
            </div>
        )
    }

    setActiveProject(index){
        this.setState({activeProject:this.state.projects[index]})
    }

    render(){
        return(
            <section className="Dashboard">
               <div className="header">
                    <h1>Welcome {this.state.name}</h1>
                    <button className="logout" onClick={this.props.logout}>Logout</button>
               </div>
               {!this.state.activeProject ? (
                <div className="projects">
                    <div className="title-bar">
                        <div>
                            <h2>Projects</h2>
                            <p>Monitor web projects in real time</p>
                        </div>
                        <div>
                            <button onClick={this.startCreateNewProject}>Create new project</button>
                        </div>
                    </div>
                    <div className="projects-list">
                        {this.state.createNew ? this.renderNewProject() : null}
                        <ProjectList projects={this.state.projects} setActiveProject={this.setActiveProject}/>
                    </div> 
                </div>

               ) : 
                <Project
                    project={this.state.activeProject}
                    back={() => {this.setActiveProject(null)}}
                />}

            </section>
        )
    }
}