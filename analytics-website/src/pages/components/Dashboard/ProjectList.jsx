import React from "react";
import ProjectCard from "./ProjectCard";

export default function ProjectList(props){
    let projects = props.projects;

    if (projects.length === 0){
        return (
            <div>
                <p>No projects</p>
            </div>
        )
    }
    return(
        projects.map((project, index) => {
            let hrs_24 = + new Date() - 1000*60*60*24;
            let todays_clicks = [];
            if (project.clicks){
                todays_clicks = Object.values(project.clicks).filter(click => {
                    if (click.dt > hrs_24){
                        return click;
                    }
                })
            }
            let todays_visits = [];
            if (project.visits){
                todays_visits = Object.values(project.visits).filter(visit => {
                if (visit.dt > hrs_24){
                    return visit;
                }
            })
            }
            
            return <ProjectCard key={index} name={project.name} clicks={todays_clicks} visits={todays_visits} onClick={() => {props.setActiveProject(index)}}/>
        })
    )
}