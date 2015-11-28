'use strict';

import LeftSidebar from './section-left/LeftSidebar.jsx'
import Main from './section-main/Main.jsx'
import RightSidebar from './section-right/RightSidebar.jsx'
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import { addTodo, completeTodo, setVisibilityFilter, VisibilityFilters } from '../actions'

class App extends React.Component {
	render() {
		console.log(this.props);
		// const { dispatch } = this.props;
		return (
			<section className="ui grid">
				<LeftSidebar />
				<Main />
				<RightSidebar />
			</section>
		);
	}
};

let select = (state) => {
	return state;
}

export default connect(select)(App);