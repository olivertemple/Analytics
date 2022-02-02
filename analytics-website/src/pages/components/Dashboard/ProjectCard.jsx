import React, { useEffect } from "react";
import { LineChart, Line, Tooltip, XAxis,ResponsiveContainer } from 'recharts';

export default function ProjectCard(props){
    const calculate_bounce_rate = () => {
        let bounced = 0;
        let total = props.visits.length;
        if (total === 0){
            return 0;
        }
        props.visits.forEach(visit => {
            if (visit.bounce){
                bounced++;
            }
        })

        return (bounced/total * 100).toFixed(2);
    }

    const get_chart_data = () => {
        let data = {};
        props.visits.forEach(visit => {
            let dt = visit.dt - (visit.dt % (1000*60));
            if (data[dt]){
                data[dt] ++;
            }else{
                data[dt] = 1;
            }
        })
    
        let values = Object.values(data);
        let keys = Object.keys(data);
        let chart_data = [];
        for (let i = 0; i < values.length; i++){
            chart_data.push({
                dt: keys[i],
                visits: values[i]
            })
        }
        return chart_data;    
    }

    const formatter = (dt) => {
        let date = new Date(parseInt(dt));
        return date.toLocaleTimeString().slice(0,5);
    }
    

    return(
        <div className="project-card" onClick={props.onClick}>
            <div className="project-card-header">
                <h3>{props.name}</h3>
            </div>
            <div className="project-card-content">
                <div className="overview">
                    <h4>Past 24hrs</h4>
                    <div className="clicks">
                        <h4>Clicks</h4>
                        <p>Total: {props.clicks.length}</p>
                    </div>
                    <div className="visits">
                        <h4>Visits</h4>
                        <p>Total: {props.visits.length}</p>
                    </div>
                    <div className="bounce-rate">
                        <h4>Bounce Rate</h4>
                        <p>{calculate_bounce_rate()}%</p>
                    </div>
                </div>
                <div className="project-card-chart">
                    <ResponsiveContainer width="100%">
                        <LineChart data={get_chart_data()}>
                            <Line type="monotone" dataKey="visits" stroke="blue" dot={false} />
                            <XAxis dataKey="dt" tickFormatter={formatter}/>
                            <Tooltip labelFormatter={formatter} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

    )
}