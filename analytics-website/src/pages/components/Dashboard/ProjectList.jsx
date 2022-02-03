import React, { useState } from "react";
import ProjectCard from "./ProjectCard";
import { AiOutlineSearch, AiOutlineMenu } from "react-icons/ai";
export default function ProjectList(props){
    let projects = props.projects;
    let [search, setSearch] = useState("");

    if (!projects){
        return (
            <div>
                <p>No projects</p>
            </div>
        )
    }

    const renderCards = () => {return(
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
            if (search === "" || project.name.toLowerCase().includes(search.toLowerCase())){
                return <ProjectCard key={index} name={project.name} clicks={todays_clicks} visits={todays_visits} onClick={() => {props.setActiveProject(index)}}/>
            }
        })
    )}

    return (
        <>
            <div className="search-bar">
                <AiOutlineMenu size={20} className="menu" onClick={props.showMenu}/>
                <AiOutlineSearch size={20}/>
                <input type="text" placeholder="Search..." value={search} onChange={(e) => {setSearch(e.target.value); props.setActiveProject(null)}}/>
            </div>
            {renderCards()}
        </>
    )
}