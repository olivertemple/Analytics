import React from "react";
import "../../styles/Project.scss";
import { BiArrowBack } from "react-icons/bi";
import { LineChart, Line, Tooltip, XAxis,ResponsiveContainer, ComposedChart } from 'recharts';

export default class Project extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: "7days",
            startDate: null,
            endDate: null,
            clicksData: [],
            visitsData: [],
            clicksTotal: 0,
            visitsTotal: 0,
            loadAvg: 0,
            countries: []
        }
        this.formatter = this.formatter.bind(this);
        this.getDataForCharts = this.getDataForCharts.bind(this);
        this.setActive = this.setActive.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.setEndDate = this.setEndDate.bind(this);
    }

    componentDidMount(){
        this.getDataForCharts();
    }

    setActive(active){
        this.setState({
            active: active
        }, () => {
            this.getDataForCharts();
        })

    }

    setStartDate(e){
        let date = + new Date(e.target.value);
        this.setState({
            startDate: date
        }, () => {
            this.getDataForCharts();
        })
    }

    setEndDate(e){
        let date = + new Date(e.target.value);
        this.setState({
            endDate: date
        }, () => {
            this.getDataForCharts();
        })
    }

    getDataForTimeframe(){
        let startDate;
        let endDate;
        if (this.state.active === "24hrs"){
            startDate = + new Date() - (1000*60*60*24);
            endDate = + new Date();
        }else if (this.state.active === "7days"){
            startDate = + new Date() - (1000*60*60*24*7);
            endDate = + new Date();
        }else if (this.state.active === "30days"){
            startDate = + new Date() - (1000*60*60*24*30);
            endDate = + new Date();
        }else if (this.state.active === "custom"){
            startDate = this.state.startDate;
            endDate = this.state.endDate + 1000 * 60 * 60 * 24;
        }

        let clicks = [];
        if (Object.values(this.props.project.clicks).length > 0){
            clicks = Object.values(this.props.project.clicks).filter(click => {
                if (click.dt > startDate && click.dt < endDate){
                    return click;
                }
            })
        }
        
        let visits = [];
        if (Object.values(this.props.project.clicks).length > 0){
            visits = Object.values(this.props.project.visits).filter(visit => {
                if (visit.dt > startDate && visit.dt < endDate){
                    return visit;
                }
            })
        }
        
        return { clicks, visits };
    }

    getDataForCharts(){
        let { clicks, visits } = this.getDataForTimeframe();
        let clicksDataObj = {};
        let visitsDataObj = {};
        let loadDataObj = {};
        let uniqueVisits = [];
        let uniqueVisitsObj = {};
        let coreWebVitalsObj = {};
        let countries = [];


        let divisor;
        switch (this.state.active){
            case "24hrs":
                divisor = 1000*60;
                break;
            case "7days":
                divisor = 1000*60;
                break;
            case "30days":
                divisor = 1000*60;
                break;
            default:
                divisor = 1000*60;
                break;
        }

        clicks.forEach(click => {
            let dt = click.dt - (click.dt % divisor);
            if (!clicksDataObj[dt]){
                clicksDataObj[dt] = 1;
            }else{
                clicksDataObj[dt]++;
            }
        })
        
        visits.forEach(visit => {
            let dt = visit.dt - (visit.dt % divisor);

            if (!countries.includes(visit.country)){
                countries.push(visit.country);
            }
            
            if (!visitsDataObj[dt]){
                visitsDataObj[dt] = [visit];
            }else{
                visitsDataObj[dt].push(visit);
            }

            if (visit.load_time && visit.load_time !== NaN){
                if (!loadDataObj[dt]){
                    loadDataObj[dt] = visit.load_time;
                }else{
                    loadDataObj[dt] = (loadDataObj[dt] + visit.load_time)/2;
                }
            }
            if (!uniqueVisits.includes(visit.fingerprint)){
                uniqueVisits.push(visit.fingerprint);
                if (!uniqueVisitsObj[dt]){
                    uniqueVisitsObj[dt] = [visit];
                }else{
                    uniqueVisitsObj[dt].push(visit);
                }
            }

            if (!coreWebVitalsObj[dt]){
                let obj = {};
                if (visit.CLS){obj.CLS = visit.CLS}else{obj.CLS = 0};
                if (visit.FCP){obj.FCP = visit.FCP / 1000}else{obj.FCP = 0};
                if (visit.LCP){obj.LCP = visit.LCP / 1000}else{obj.LCP = 0};
                if (visit.TTFB){obj.TTFB = visit.TTFB}else{obj.TTFB = 0};
                if (visit.FID){obj.FID = visit.FID / 1000}else{obj.FID = 0};
                if (Object.values(obj).length > 0){
                    coreWebVitalsObj[dt] = obj;
                }
            }else{
                if (visit.CLS){
                    if (coreWebVitalsObj[dt].CLS){
                        coreWebVitalsObj[dt].CLS = (coreWebVitalsObj[dt].CLS + visit.CLS)/2
                    }else{
                        coreWebVitalsObj[dt].CLS = visit.CLS;
                    }
                }

                if (visit.FCP){
                    if (coreWebVitalsObj[dt].FCP){
                        coreWebVitalsObj[dt].FCP = (coreWebVitalsObj[dt].FCP + visit.FCP / 1000)/2
                    }else{
                        coreWebVitalsObj[dt].FCP = visit.FCP / 1000;
                    }
                }

                if (visit.LCP){
                    if (coreWebVitalsObj[dt].LCP){
                        coreWebVitalsObj[dt].LCP = (coreWebVitalsObj[dt].LCP + visit.LCP / 1000)/2
                    }else{
                        coreWebVitalsObj[dt].LCP = visit.LCP / 1000;
                    }
                }

                if (visit.TTFB){
                    if (coreWebVitalsObj[dt].TTFB){
                        coreWebVitalsObj[dt].TTFB = (coreWebVitalsObj[dt].TTFB + visit.TTFB)/2
                    }else{
                        coreWebVitalsObj[dt].TTFB = visit.TTFB;
                    }
                }

                if (visit.FID){
                    if (coreWebVitalsObj[dt].FID){
                        coreWebVitalsObj[dt].FID = (coreWebVitalsObj[dt].FID / 1000 + visit.FID)/2
                    }else{
                        coreWebVitalsObj[dt].FID = visit.FID / 1000;
                    }
                }
            }
        })


        let values = Object.values(clicksDataObj);
        let keys = Object.keys(clicksDataObj);
        let clicksData = [];
        for (let i = 0; i < values.length; i++){
            clicksData.push({
                dt: keys[i],
                clicks: values[i]
            })
        }

        values = Object.values(visitsDataObj);
        keys = Object.keys(visitsDataObj);

        let visitsData = [];
        for (let i = 0; i < values.length; i++){
            let obj = {
                dt: keys[i],
                visits: values[i].length,
            }
            values[i].forEach(visit => {
                if (obj[visit.country]){
                    obj[visit.country]++;
                }else{
                    obj[visit.country] = 1;
                }

            })

            let objKeys = Object.keys(obj);
            countries.forEach(country => {
                if (!objKeys.includes(country)){
                    obj[country] = 0;
                }
            })

            visitsData.push(obj);
        }

        values = Object.values(uniqueVisitsObj);
        keys = Object.keys(uniqueVisitsObj);
        let uniqueVisitsData = [];
        for (let i = 0; i < values.length; i++){
            let obj = {
                dt: keys[i],
                unique_visits: values[i].length
            }
            values[i].forEach(visit => {
                if (obj[visit.country]){
                    obj[visit.country]++;
                }else{
                    obj[visit.country] = 1;
                }
            })

            let objKeys = Object.keys(obj);
            countries.forEach(country => {
                if (!objKeys.includes(country)){
                    obj[country] = 0;
                }
            })

            uniqueVisitsData.push(obj);
        }
    
        values = Object.values(loadDataObj);
        keys = Object.keys(loadDataObj);
        let loadData = [];
        for (let i = 0; i < values.length; i++){
            loadData.push({
                dt: keys[i],
                load_time: values[i]
            })
        }

        

        values = Object.values(coreWebVitalsObj);
        keys = Object.keys(coreWebVitalsObj);
        let coreWebVitalsData = [];
        for (let i = 0; i < values.length; i++){
            coreWebVitalsData.push({
                dt: keys[i],
                CLS: values[i].CLS,
                FCP: values[i].FCP,
                LCP: values[i].LCP,
                TTFB: values[i].TTFB,
                FID: values[i].FID
            })
        }
       
        let sumCLS = 0; let numCLS = 0;
        let sumFCP = 0; let numFCP = 0;
        let sumLCP = 0; let numLCP = 0;
        let sumTTFB = 0; let numTTFB = 0;
        let sumFID = 0; let numFID = 0;

        coreWebVitalsData.forEach(data => {
            if (data.CLS){sumCLS += data.CLS; numCLS += 1;};
            if (data.FCP){sumFCP += data.FCP; numFCP += 1;};
            if (data.LCP){sumLCP += data.LCP; numLCP += 1;};
            if (data.TTFB){sumTTFB += data.TTFB; numTTFB += 1;};
            if (data.FID){sumFID += data.FID; numFID += 1;};
        })
        let avgCLS = (sumCLS / numCLS).toFixed(2);
        let avgFCP = (sumFCP / numFCP).toFixed(2);
        let avgLCP = (sumLCP / numLCP).toFixed(2);
        let avgTTFB = (sumTTFB / numTTFB).toFixed(2);
        let avgFID = (sumFID / numFID).toFixed(2);

        this.setState({
            clicksData: clicksData,
            visitsData: visitsData,
            loadData: loadData,
            clicksTotal: clicks.length,
            visitsTotal: visits.length,
            uniqueVisits: uniqueVisits.length,
            uniqueVisitsData: uniqueVisitsData,
            coreWebVitalsData: coreWebVitalsData,
            avgCLS: avgCLS,
            avgFCP: avgFCP,
            avgLCP: avgLCP,
            avgTTFB: avgTTFB,
            avgFID: avgFID,
            loadAvg: loadData.reduce((a,b) => a + b.load_time, 0)/loadData.length,
            countries: countries
        })
    }

    formatter(dt){
        let date = new Date(parseInt(dt));
        if (this.state.active === "24hrs"){
            return date.toLocaleTimeString().slice(0,5);
        }else if (this.state.active === "7days"){
            return `${date.toLocaleDateString().slice(0,5)} ${date.toLocaleTimeString().slice(0,5)}`;
        }else if (this.state.active === "30days"){
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString().slice(0,5)}`;
        }else{
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }
    }

    stringToColour(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
          var value = (hash >> (i * 8)) & 0xFF;
          colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    render(){
        console.log(this.props)
        return(
            <div className="project-container">
                <div className="project-name">
                    <BiArrowBack className="back" size={20} onClick={this.props.back}/>
                    <h2>{this.props.project.name}</h2>
                </div>
                <div className="timeframe-select">
                    <h3>Timeframe</h3>
                    <div className="timeframe-options">
                        <div className={`timeframe-option ${this.state.active === "24hrs" ? "active" : null}`} onClick={() => {this.setActive("24hrs")}}>
                            <p>24 hrs</p>
                        </div>
                        <div className={`timeframe-option ${this.state.active === "7days" ? "active" : null}`} onClick={() => {this.setActive("7days")}}>
                            <p>7 days</p>
                        </div>
                        <div className={`timeframe-option ${this.state.active === "30days" ? "active" : null}`} onClick={() => {this.setActive("30days")}}>
                            <p>30 days</p>
                        </div>
                        <div className={`timeframe-option ${this.state.active === "custom" ? "active" : null}`}onClick={() => {this.setActive("custom")}}>
                            <p>custom</p>
                        </div>
                    </div>
                    {this.state.active === "custom" ? (
                        <div className="custom-select">
                            <div className="custom-select-container">
                                <input className="date" type="date" placeholder="Start Date" onChange={this.setStartDate}/>
                                <input className="date" type="date" placeholder="End Date" onChange={this.setEndDate}/>
                            </div>
                        </div>
                    ) : null}
                </div>
                <div className="data">
                    <div className="data-container">
                        <div className="charts">
                            <div className="clicks">
                                <h3>Clicks: {this.state.clicksTotal}</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={this.state.clicksData}>
                                        <Line type="monotone" dataKey="clicks" stroke="blue" dot={false} />
                                        <XAxis dataKey="dt" tickFormatter={this.formatter}/>
                                        <Tooltip labelFormatter={this.formatter} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="visits">
                                <h3>Visits: {this.state.visitsTotal}</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={this.state.visitsData}>
                                        <Line type="monotone" dataKey="visits" stroke="blue" dot={false} />
                                        {
                                            this.state.countries.map((country, i) => {
                                                return <Line key={i} type="monotone" dataKey={country} stroke={this.stringToColour(country)} dot={false} />
                                            })
                                        }
                                        <XAxis dataKey="dt" tickFormatter={this.formatter}/>
                                        <Tooltip labelFormatter={this.formatter}/>
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="unique-visits">
                                <h3>Unique visits: {this.state.uniqueVisits}</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={this.state.uniqueVisitsData}>
                                        <Line type="monotone" dataKey="unique_visits" stroke="blue" dot={false} />
                                        {
                                            this.state.countries.map((country, i) => {
                                                return <Line key={i} type="monotone" dataKey={country} stroke={this.stringToColour(country)} dot={false} />
                                            })
                                        }
                                        <XAxis dataKey="dt" tickFormatter={this.formatter}/>
                                        <Tooltip labelFormatter={this.formatter} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="load-time">
                                <h3>Load Time: {this.state.loadAvg.toFixed(2)}ms</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={this.state.loadData}>
                                        <Line type="monotone" dataKey="load_time" stroke="blue" dot={false} />
                                        <XAxis dataKey="dt" tickFormatter={this.formatter}/>
                                        <Tooltip labelFormatter={this.formatter} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="core-web-vitals">
                                <h3>Core Web Vitals</h3>
                                <div className="core-web-vitals-avg">
                                    <h4 className={this.state.avgCLS<= 0.1 ? "good" : this.state.avgCLS <= 0.25 ? "okay" : "bad"}>CLS: {this.state.avgCLS}</h4>
                                    <h4 className={this.state.avgFID<= 0.1 ? "good" : this.state.avgFID <= 0.3 ? "okay" : "bad"}>FID: {this.state.avgFID}s</h4>
                                    <h4 className={this.state.avgFCP<= 1.8 ? "good" : this.state.avgFCP <= 3 ? "okay" : "bad"}>FCP: {this.state.avgFCP}s</h4>
                                    <h4 className={this.state.avgLCP<= 2.5 ? "good" : this.state.avgLCP <= 4 ? "okay" : "bad"}>LCP: {this.state.avgLCP}s</h4>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={this.state.coreWebVitalsData}>
                                        <Line type="monotone" dataKey="CLS" stroke="blue" dot={false} />
                                        <Line type="monotone" dataKey="FID" stroke="red" dot={false} />
                                        <Line type="monotone" dataKey="FCP" stroke="orange" dot={false} />
                                        <Line type="monotone" dataKey="LCP" stroke="green" dot={false} />
                                        <XAxis dataKey="dt" tickFormatter={this.formatter}/>
                                        <Tooltip labelFormatter={this.formatter} formatter={text => {return parseFloat(text).toFixed(2)}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="TTFB">
                                <h3>TTFB: {this.state.avgTTFB}ms</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={this.state.coreWebVitalsData}>
                                        <Line type="monotone" dataKey="TTFB" stroke="blue" dot={false} />
                                        <XAxis dataKey="dt" tickFormatter={this.formatter}/>
                                        <Tooltip labelFormatter={this.formatter} formatter={text => {return parseFloat(text).toFixed(2)}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                      
                    </div>
                </div>
            </div>
        )
    }
}