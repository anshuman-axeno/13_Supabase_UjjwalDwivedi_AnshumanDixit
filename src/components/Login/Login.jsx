import {useState} from 'react'
import supabase from '../../supabase';
import "./Login.css";

export default function Login(prop) {

  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error){
      alert(error.message);
      return;
    }
    prop.onLoginSuccess(data.user);
  }

  return (
    <section className="login">
      <h1 className="login__title">Login</h1>
      <form id="login-form" className="login__form" onSubmit={handleSubmit}>
        <div className="login__field">
          <label className="login__label" htmlFor="email">Email</label>
          <input className='login__input' type="email" id="email" name="email" value={email} required onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="login__field">
          <label className="login__label" htmlFor="password">Password</label>
          <input className='login__input' type="password" id="password" name="password" value={password} required onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit" className="login__button">Login</button>
      </form>
    </section>
  )
}
