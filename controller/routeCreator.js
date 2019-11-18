import setRoute from './setRoute'

// function createRoute
// In order to Create all the route for all the Collection
export default function createRoute (route, collection, schema) {
    
    // (without target)
    setRoute('get', route, collection)
    //  (with target)
    setRoute('get', route, false, schema, true)
    // (create)
    setRoute('put', route, false, schema)
    // (update)
    setRoute('post', route, false, schema)
    //  delete
    setRoute('delete', route, false, schema)

}
