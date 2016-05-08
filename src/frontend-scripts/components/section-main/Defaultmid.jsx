'use strict';

import React from 'react';

export default class Defaultmid extends React.Component {
	render() {
		return (
			<section className="defaultmid">
				<img src="images/ww-logo-fs2.png" style={{position: 'absolute', left: '50%', marginLeft: '-275px',top: '70px',opacity: '0.1', width: '550px'}}/>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Uther" className="loginquick">Uther</button>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Jaina" className="loginquick">Jaina</button>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Rexxar" className="loginquick">Rexxar</button>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Malfurian" className="loginquick">Malfurian</button>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Thrall" className="loginquick">Thrall</button>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Valeera" className="loginquick">Valeera</button>
				<br />
				<button style={{padding: '10px', width: '80px'}} data-name="Anduin" className="loginquick">Anduin</button>
				<br />
				<button style={{padding: '10px', background: '#333', color: 'white'}} data-name="h" onClick={this.props.quickDefault}>default game</button>
				

			</section>
		);
	}
};