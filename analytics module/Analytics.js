import app from "./FirebaseInit";
import { getDatabase, ref, set, push } from "firebase/database";
import getBrowserFingerprint from 'get-browser-fingerprint';
import {getLCP, getFID, getCLS, getFCP, getTTFB } from 'web-vitals';

export class Analytics{
    constructor(project_id){
        console.log("new analytics")
        this.project_id = project_id;
        this.session_id = "";
        this.last_interaction = + new Date();
        this.start = + new Date();
        this.number_interactions = 0;
        this.db = getDatabase(app);

        this.send_click = this.send_click.bind(this);

        this.add_visit();

        if (typeof window !== 'undefined'){
            window.addEventListener("beforeunload", () => {
                let length_of_visit = + new Date() - this.start;
                if (length_of_visit < 2500){
                    set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/bounce"), true)
                }
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/length_of_visit"), length_of_visit)
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/interactions"), this.number_interactions)
            });
        }
    } 

    async add_visit(){
        let device_type = this.getDeviceType();
        let OS = null;
        let user_agent = null;
        if (typeof navigator !== 'undefined'){
            OS = navigator.userAgentData.platform;
            user_agent = navigator.userAgent;
        }

        let info = await fetch("https://ipapi.co/json/");
        let info_json = await info.json();
        let country = info_json.country_code;
        let city = info_json.city;
        let ip = info_json.ip;
        let region = info_json.region;
        let load_time = null;
        if (typeof window !== 'undefined'){
            load_time = window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart;
        }

        const fingerprint = getBrowserFingerprint();


        // send visit data to server
        push(ref(this.db, "/projects/"+this.project_id+"/visits/"), {
            device_type: device_type,
            OS: OS,
            user_agent: user_agent,
            country: country,
            city: city,
            ip: ip,
            region: region,
            dt: + new Date(),
            load_time:load_time,
            fingerprint: fingerprint
        }).then(res => {
            this.visit_key = res.key;
            
            getLCP(res => {//largest contentful paint (ms)
                //<2.5s good, <4s ok, >4s bad
                let LCP = res.value;
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/LCP"), LCP)
            })
        
            getFID(res => {//first input delay
                //<100ms good, <300ms ok, >300ms bad
                let FID = res.value;
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/FID"), FID)
            })

            getCLS(res => {//cumulative layout shift
                //<0.1 good, <0.25 ok, >0.25 bad
                let CLS = res.value;
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/CLS"), CLS)
            })

            getFCP(res => {//first contentful paint
                //<1.8s good, <3s ok, >3s bad
                let FCP = res.value;
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/FCP"), FCP)
            })

            getTTFB(res => {//time to first byte
                //no good/bad
                let TTFB = res.value;
                set(ref(this.db, "/projects/"+this.project_id+"/visits/"+this.visit_key+"/TTFB"), TTFB)
            })
        })
    }
 
    getDeviceType(){
        if (typeof navigator !== 'undefined'){
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                return "tablet";
            }
            if (
                /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
                ua
                )
            ) {
                return "mobile";
            }
            return "desktop";
        }else{
            return null;
        }
        
    };


    update_last_interaction(){
        this.number_interactions += 1;
        if (this.last_interaction < (+ new Date() - 1000 * 60 * 30)){
            this.update_session_id();
        }
        this.last_interaction = + new Date();
    }

    update_session_id(){
        // update session_id
        console.log("update session_id");
    }

    send_click(e){
        let x = e.pageX;
        let y = e.pageY;
        let pointerType = e.pointerType;
        let time_from_load = e.timeStamp;
        // send click data to server
        push(ref(this.db, "/projects/"+this.project_id+"/clicks"), {
            x: x,
            y: y,
            pointerType: pointerType,
            time_from_load: time_from_load,
            dt: + new Date()
        })

        console.log("send click data to server for session_id: " + this.session_id);
    }

    clicks(){
        this.update_last_interaction();
        if (typeof window !== 'undefined'){
            window.addEventListener("click", this.send_click);
        }
    }
}