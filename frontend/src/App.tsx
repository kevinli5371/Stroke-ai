import './App.css'
import { useState } from 'react';

function App() {
  const [command, setCommand] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      const plan = data.plan;

      // alert(JSON.stringify(plan));

      const status = await fetch("http://127.0.0.1:8000/api/apply-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const statusData = await status.json();
      alert(`Status: ${statusData.combo}`);

    } catch (error) {
      alert(String(error));
    }
  };

  return (
    <>
      <div>
        <form onSubmit={(e) => {e.preventDefault(); handleSubmit();}}>  
          <h1>Input a command</h1>
          <input 
            type="text" 
            placeholder="Type your command here..." 
            onChange={(e) => setCommand(e.target.value)} 
            value={command} 
            />
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  )
}

export default App
