'use strict';

import React from 'react';

export default class Defaultmid extends React.Component {
	render() {
		return (
			<section className="defaultmid">
				Welcome to One Night Werewolf
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="jin" className="loginquick">login jin</button>
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="paul" className="loginquick">login paul</button>
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="heichachi" className="loginquick">login heihachi</button>
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="nina" className="loginquick">login nina</button>
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="anna" className="loginquick">login anna</button>
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="marshall" className="loginquick">login marshall</button>
				<br />
				<button style={{padding: '20px', width: '150px'}} data-name="kazuya" className="loginquick">login kazuya</button>
				<br />
				<button style={{padding: '20px', background: 'blue', color: 'white'}} data-name="h" onClick={this.props.quickDefault}>default game</button>
				

			</section>
		);
	}
};