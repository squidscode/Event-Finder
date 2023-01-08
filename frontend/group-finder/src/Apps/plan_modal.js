import './popup.css';
import React from 'react';

function getChecked(id){
    const element = document.getElementById(id);
    return element.checked;
}

function getValue(id){
    const element = document.getElementById(id);
    return element.value;
}

function PlanModal(props){
    return (
        <div className="form-popup middle" id="planForm">
            <div className="form-container">
            <h1 class="center">New Plan</h1>
                <button className="hide-button" onClick={() => {props.close()}}>&times;</button>

                <label for="title"><b>Title</b></label>
                <input type="text" placeholder="Enter Title" name="title" id="plan_title_field" required />

                <label for="location_details"><b>Location Details (optional)</b></label>
                <input type="text" placeholder="Enter Location Details" name="loc_details" id="plan_location_details_field" required />

                <label for="time"><b>Time</b></label><br />
                <input type="datetime-local" placeholder="When will this happen?" name="when" id="plan_time_field" required /><br /><br />

                <label for="frequency"><b>Frequency</b></label>
                <input type="text" placeholder="How often will this happen?" name="frequency" id="plan_frequency_field" required />

                <label for="description"><b>Description</b></label><br />
                <textarea id="plan_description_field" rows="4" cols="30">
                </textarea><br /><br />

                <label for="description"><b>Location: ({Math.floor(props.lat*10000)/10000}, {Math.floor(props.lng*10000)/10000})</b></label><br /><br />

                <input type="checkbox" id="plan_public_field" name="public" value="public" />
                <label for="public"> Public (ie. shown on home screen)</label><br /><br />

                <button className="btn" onClick={() => {
                    props.submit({
                        title: getValue('plan_title_field'), 
                        location_details: getValue('plan_location_details_field'),
                        time: getValue('plan_time_field'),
                        frequency: getValue('plan_frequency_field'),
                        description: getValue('plan_description_field'),
                        route: {points:[
                            {lat: props.lat, lng: props.lng}
                        ]},
                        public: getChecked('plan_public_field')});
                }}>Submit</button>
            </div>
        </div>
    );
}

export default PlanModal;