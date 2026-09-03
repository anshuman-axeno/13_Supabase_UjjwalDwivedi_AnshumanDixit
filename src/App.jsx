import { useState, useEffect } from "react";
import supabase from './supabase';
import "./App.css";

import Navbar from "./components/Navbar/Navbar";
import ProductDescription from "./components/ProductDescription/ProductDescription";
import ProductList from "./components/ProductList/ProductList";
import SearchBar from "./components/SearchBar/SearchBar";
import Cart from "./components/Cart/Cart";
import Badge from "./components/Badge/Badge";
import Login from "./components/Login/Login";

function App() {
  const [cartItems, setCartItems] = useState([]);

  const [user,setUser]=useState(null);
  const [products, setProducts]=useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none");

  useEffect(()=>{
    async function fetchProducts(){
    const {data,error}=await supabase.from('products').select('*');
    if(error){
      alert('Backend Error: ' + error.message);
      return;
    }
    setProducts(data);
  }
  fetchProducts();
}
    ,[])

  async function fetchCart(){
      if(user===null) return;
      const {data,error}=await supabase.from('cart_items').select('*,products(*)').eq('user_id',user.id)
      if(error){
        alert(error.message);
        return;
      }
      setCartItems(data);
    }

  useEffect(()=>{
    fetchCart();
  },[user])

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      setUser(data.session?.user ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
  });

  return () => listener.subscription.unsubscribe();
}, []);
  

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleSortChange(e) {
    setSortOrder(e.target.value);
  }


  async function handleAddToCart(product){
    const existingItem = cartItems.find(function (item) {
    return item.product_id === product.id;
  });

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + 1
      })
      .eq("id", existingItem.id);

    if (error) {
      alert(error.message);
      return;
    }
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1
      });

    if (error) {
      alert(error.message);
      return;
    }
  }

  await fetchCart();
  }

  async function handleIncrease(id) {
  const item = cartItems.find(function (item) {
    return item.id === id;
  });
  if (!item) return;

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: item.quantity + 1 })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }
  await fetchCart();
}

async function handleDecrease(id) {
  const item = cartItems.find(function (item) {
    return item.id === id;
  });
  if (!item) return;

  if (item.quantity <= 1) {
    await handleRemove(id);
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: item.quantity - 1 })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }
  await fetchCart();
}

async function handleRemove(id) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }
  await fetchCart();
}

async function clearCart() {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    alert(error.message);
    return;
  }
  await fetchCart();
}

  let filteredProducts = [];
  for (let i = 0; i < products.length; i++) {
    if (products[i].name.toLowerCase().includes(searchTerm.toLowerCase())) {
      filteredProducts.push(products[i]);
    }
  }

  let sortedProducts = filteredProducts.slice();
  if (sortOrder === "low-to-high") {
    sortedProducts.sort(function (a, b) {
      return a.price - b.price;
    });
  } else if (sortOrder === "high-to-low") {
    sortedProducts.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  let totalCartCount = 0;
  for (let i = 0; i < cartItems.length; i++) {
    totalCartCount = totalCartCount + cartItems[i].quantity;
  }

  return (
    (user===null) 
    ?
    <Login onLoginSuccess={setUser}></Login> 
    :
    <div id="top">
      <Navbar onLogout={setUser}/>

      <ProductDescription />

      <section id="all-products" className="all-products">
        <div className="all-products__header">
          <h2>All Products</h2>
          <Badge text={"Cart: " + totalCartCount} color="green" />
        </div>

        <div className="all-products__controls">
        <SearchBar value={searchTerm} onChange={handleSearchChange} />

        <select value={sortOrder} onChange={handleSortChange}>
          <option value="none">Sort by</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
        </div>

        <ProductList
          products={sortedProducts}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
        />
      </section>

      <section className="cart-section">
        <h2>Your Cart</h2>
        <Cart
          cartItems={cartItems}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onRemove={handleRemove}
        />
        {cartItems.length > 0 && (
          <button className="cart__clear-btn" onClick={clearCart}>Clear Cart</button>
        )}
      </section>
    </div>
  );
}

export default App;