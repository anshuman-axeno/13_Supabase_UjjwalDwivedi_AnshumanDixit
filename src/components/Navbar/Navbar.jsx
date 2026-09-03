import hero from "../../assets/hero-image.jpg";
import supabase from "../../supabase";
import "./Navbar.css";


function Navbar(props) {

  async function handleLogout(){
    await supabase.auth.signOut();
    props.onLogout(null)

  }
  return (
    <nav className="navbar">
      <a href="#top" className="navbar__logo">
      <img className="navbar__image" src={hero}/>
      </a>
      <a href="#product-description">Product Description</a>
      <a href="#all-products">All Products</a>
      <button className="navbar__logout" onClick={handleLogout}>Log Out</button>
    </nav>
  );
}

export default Navbar;