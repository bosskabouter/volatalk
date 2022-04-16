import React, { Component } from 'react'

import PropTypes from 'prop-types'

interface Props {
    
}
 
interface State {
    user:{};
}
 
class UserDisplay extends React.Component<State> {
    
    render() { 
        return "Hallo.";
    }
}
 
export default UserDisplay;