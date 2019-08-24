import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Header from '../components/Header'
import { addTodo } from '../actions'

const mapDispatchToProps = dispatch => bindActionCreators({ addTodo }, dispatch.sync)

export default connect(null, mapDispatchToProps)(Header);
