import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { RAGInitializer } from './components/RAGInitializer'

const App = () => {
  useEffect(() => {
    document.title = 'Моё ИТ-оборудование'
  }, [])

  return (
    <Provider store={store}>
      <RAGInitializer />
      <Router>
        <Switch>
          <Route path="/" exact component={Login} />
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      </Router>
    </Provider>
  )
}

export default App
