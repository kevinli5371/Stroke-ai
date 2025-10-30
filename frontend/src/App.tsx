import './App.css'

function App() {
  return (
    <>
      <div>
        <form>  
          <h1>Input a command</h1>
          <input type="text" placeholder="Type your command here..." />
          <button type="submit" onClick={handleSubmit}>Submit</button>
        </form>
      </div>
    </>
  )
}

const handleSubmit = async () => {
  // make api call here
  const response = await fetch("http://localhost:8000/")
  const data = await response.json();
  alert(data.status);
}

export default App
