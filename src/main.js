import { base } from "./base.js";
import { initPayPalButton } from "./paypal.js";


let $productcontainer=document.querySelector('.products__list');
let $modalprods=document.querySelector('.modalpay');
let $modalname=document.querySelector('.modalpay__h2');
let $modalimage=document.querySelector('.modalpay__img');
let $modalquantity=document.querySelector('.modalpay__inumber');
let $modaltotal=document.querySelector('.modalpay__total');
let $messageinfo=document.querySelector('.message');
let $shoppingcart=document.querySelector('.shoppingcart');
let $scdata=document.querySelector('.shoppingcart__data');  //donde se llena la info del carrito
let $redpointcart=document.querySelector('.header__colorscicon');   //punto del cart cuando hay productos
let $paybtn=document.getElementById('pay');
let modalquantity=1;  //cantidad producto en modal
let shoppingcart=[];  
let actualprod={};    //producto actual seleccionado al dar clic en buy
let total=0;  
let taxpercent=0.15;  //porcentaje de impuesto
let tax=0     //impuesto enviado a paypal
 let taxsub=0; // aqui va el total * porcentaje impuesto

const categorieslist=base.map(el=>{
  if(el.status === 'published'){
    return el.category;
  }
}).sort();
let newcat=new Set(categorieslist);
let categories=Array.from(newcat);
let fragmento=document.createDocumentFragment();

const showmessageinfo=(messa)=>{
  $messageinfo.textContent=messa.message;
  $messageinfo.style.backgroundColor=messa.color;
  let time=messa.time||3
  $messageinfo.classList.add('message--show');
  setTimeout(()=>{
    $messageinfo.classList.remove('message--show');
  },time*1000)
}

const reviewshoppingcart=()=>{
  if(!localStorage.getItem('mgchart')){
    shoppingcart=[];    
    return;
  }

  shoppingcart=JSON.parse(localStorage.getItem('mgchart'))
  
}

const actualizalocalstorage=(data)=>{
  let datastring=JSON.stringify(data)
  if (data.length === 0){
    localStorage.removeItem('pending_transaction');   //aqui cambio reciente probar
    document.getElementById('paypal-button-container').innerHTML='';  //cambio reciente probar
    $redpointcart.classList.remove('header__colorscicon--show');
    limpiacarrito();
    return;
  }
  if(!localStorage.getItem('mgchart')){
    //console.log('crea localstorage',datastring)
    localStorage.setItem('mgchart',datastring)
    return;
  }
  //console.log('actualiza localstorage',datastring)
  localStorage.removeItem('mgchart')
  localStorage.setItem('mgchart',datastring)
    
}

const actualizaprecio=(precio,cantidad)=>{
    $modaltotal.textContent=(parseFloat(precio)*parseInt(cantidad)).toFixed(2);
    //console.log()
}

const datosenmodal=(id)=>{
  
  const search=base.find(el=>el.id === id)
  if (search){
    $modalname.textContent=search.name;
    $modalimage.src=search.image
    $modalquantity.value=modalquantity;
    $modaltotal.textContent=`$${search.price}`; //cambio
    
  }
}

const limpiamodal=()=>{
  $modalname.textContent='';
  $modalimage.src='';
  modalquantity=1;
  $modalquantity.value='';
  $modaltotal.textContent='';
}

const llenaproductos=()=>{
  for (let cat of categories){
    let $h2prod=document.createElement('h2');
      $h2prod.textContent=cat
  base.forEach(el=>{
              if(el.category === cat && el.status==='published'){
              let $figureprod=document.createElement('figure');
              $figureprod.classList.add('products__figure')
              $figureprod.innerHTML=`
                  <h3 class="products__figtitle" >${el.name}</h3>
                  <img class="products__img" src=${el.image} alt=${el.name}>
                  <figcaption class="products__figcaption">
                    <span><b>Price:</b></span><span>$${el.price}</span>
                    </br></br>
                    
                    <button class="products__buy" data-id=${el.id} >Buy</button>
                  </figcaption>
                `;
                fragmento.appendChild($figureprod)
              }
  })
  //$productcontainer.appendChild($h2prod)
  $productcontainer.appendChild(fragmento)
  }
  
}

const limpiacarrito=()=>{
  //borra local storage y shopping cart
  $scdata.innerHTML='';
  localStorage.removeItem('mgchart');
  $shoppingcart.classList.remove('shoppingcart--show');
  if($redpointcart.classList.contains('header__colorscicon--show')){
    $redpointcart.classList.remove('header__colorscicon--show');
  }
  total=0;
  tax=0;
  taxsub=0;
}


document.addEventListener('DOMContentLoaded',()=>{
  llenaproductos();
    if(localStorage.getItem('mgchart')){
      if(!$redpointcart.classList.contains('header__colorscicon--show')){
          $redpointcart.classList.add('header__colorscicon--show');
      }
    }
  // Revisar si quedó una transacción en el aire
    if (localStorage.getItem('pending_transaction')) {
      showmessageinfo({ 
        message: 'We noticed a pending payment attempt. Please check your email for a PayPal receipt before trying to pay again.', 
        color: 'orange',
        time:3 
    });
    
    
    setTimeout(() => {
            let conf = confirm('Did you complete the payment? (Check your email for a PayPal receipt). \n\nClick OK to clear your cart, or Cancel to try paying again.');
            
            if (conf) {
                localStorage.removeItem('pending_transaction');
                limpiacarrito(); // Esto borra mgchart y limpia el HTML del carrito
            } else {
                // Si dice que NO, borramos solo el pendiente para que el mensaje 
                // no vuelva a salir cada vez que recargue, pero dejamos el mgchart.
                localStorage.removeItem('pending_transaction');
                
                
            }
    }, 500);
  }
})

const loadshoppingcart=()=>{
  let $title=document.querySelector('.shoppingcart__title')
 
  if(!localStorage.getItem('mgchart')){
    $title.textContent='Shopping cart is empty';
    return;
  }

  
  let loaddata=JSON.parse(localStorage.getItem('mgchart'));
  //console.log(loaddata)
  let sctotal=loaddata.reduce((acum,el)=>{
  
    let subto=(parseFloat(el.unit_amount.value) * parseInt(el.quantity));
    return acum+subto;
  },0)

  
  taxsub=parseFloat(sctotal) * taxpercent
  total=sctotal.toFixed(2); //pasamos el total a total para el envio a paypal
  tax=taxsub.toFixed(2);
  $title.textContent='Items';
  $scdata.innerHTML=`
    <table class="sctable">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>PRICE</th>
                    <th>QTY</th>
                    <th>PARTIAL</th>
                    <th>DELETE</th>
                  </tr>
                </thead>
                <tbody class="sctbody">

                  ${loaddata.map(el=>
                    `
                    <tr>
                      <td>${el.name}</td>
                      <td>${el.unit_amount.value}</td>
                      <td>${el.quantity}</td>
                      <td>${(parseFloat(el.unit_amount.value) * parseInt(el.quantity)).toFixed(2)}</td>
                      <td><button  data-id=${el.id} data-name="${el.name}" class="scdeletebtno" >🗑️</button></td>
                    </tr>
                    `
                  ).join('')}
                </tbody>
              </table>

              <p><span><b>SUBTOTAL:</b></span>
              <span class="sctotal">$${sctotal.toFixed(2)}</span>
              </p>
              
              <p><span><b>TAX 15%:</b></span>
              <span class="sctotal">$${taxsub.toFixed(2)}</span>  
              </p>
              
              <p>
              <span><b>TOTAL:</b></span>
              <span class="sctotal">$${(sctotal + taxsub).toFixed(2)}</span>
              </p>
  
  `;
  
}

const completeadd=()=>{
  //al agregar producto completa el agregar data al carrito
  $modalprods.classList.remove('modalpay--show')
    let messagesend={
      message:`Product ${actualprod.name} added to shopping cart`,
      color:'green',
      time:3
    }
    showmessageinfo(messagesend)
    limpiamodal();
}

document.addEventListener('click',(e)=>{
  
  if(e.target.matches('.products__buy')){
    //abre modal buy
   // console.log('modal')
    $modalprods.classList.add('modalpay--show');
    actualprod=base.find(el=>el.id === parseInt(e.target.dataset.id));
    datosenmodal(parseInt(e.target.dataset.id))
  }

  if(e.target.matches('.closemodal')){
    $modalprods.classList.remove('modalpay--show')
    limpiamodal();
  }

  /*********botones de input number del modal******/
  if(e.target.matches('.modalpay__p')){
    modalquantity++;
    $modalquantity.value=modalquantity;
    actualizaprecio(actualprod.price,modalquantity)
    
  }

  if(e.target.matches('.modalpay__m')){
      modalquantity--;
      if(modalquantity < 1){
        modalquantity=1;
        return;
      }
      $modalquantity.value=modalquantity;
      actualizaprecio(actualprod.price,modalquantity)
  }

  /********manda el producto al carrito y local storage*******/
  if(e.target.matches('.modalpay__addtocart')){

    let selecprod={
      id:actualprod.id,           //cambio gemini revisar*****************************
      name:actualprod.name,
      unit_amount:{
              currency_code: "USD",
              value: actualprod.price.toString()
            },
      quantity:$modalquantity.value
      //otra opcion no probada quantity:$modalquantity.value.toString()
    }
    $redpointcart.classList.add('header__colorscicon--show');
    reviewshoppingcart();
    //console.log('sc devuelto de reviews',shoppingcart)

    //******para evitar prods duplicados busca********************* */
    let searched=shoppingcart.find(el=>el.id === selecprod.id); //busca si producto ya existe en shopping antes de agregarlo
    if(!searched){
      shoppingcart=[...shoppingcart,selecprod];
       actualizalocalstorage(shoppingcart);
       completeadd();
       return;
    }
    const newshopping=shoppingcart.map(el=>{
      if(el.id === selecprod.id){
        return {
          ...el,
          quantity:parseInt(el.quantity) + parseInt(selecprod.quantity)
          //otra opcion no probada quantity: (parseInt(el.quantity) + parseInt(selecprod.quantity)).toString()
        }
      }else{
        return el;
      }
    })
    
    actualizalocalstorage(newshopping);
    completeadd();
    
  }

  if(e.target.matches('.header__gotoshopping-cart')){
    //abre modal de shopping cart
      $shoppingcart.classList.add('shoppingcart--show');
      loadshoppingcart();
  }

  if(e.target.matches('.shoppingcart__closebtn')){
    $shoppingcart.classList.remove('shoppingcart--show');
  }

  if(e.target.matches('.scdeletebtno')){
    let loadinfo=JSON.parse(localStorage.getItem('mgchart'));
    let searched=loadinfo.filter(el=>parseInt(e.target.dataset.id) !== el.id)
    actualizalocalstorage(searched);
    loadshoppingcart();
    document.getElementById('paypal-button-container').innerHTML='';
  }

  if (e.target.matches('#pay')){
    //console.log(total,tax)
    if(!localStorage.getItem('mgchart')){
      //console.log('The shopping cart is emprty!, add a product first')
      let messagesend={
        message:'The shopping cart is empty!, add a product first',
        color:'orange',
        time:3
      }
      showmessageinfo(messagesend);
      return;
    }

    let messagesend={
        message:'Do not close this window until you are redirected back to the store to confirm your order.',
        color:'orange',
        time:4
      }
    showmessageinfo(messagesend);
    
     let datashopping=JSON.parse(localStorage.getItem('mgchart'))
    // --- NUEVA LÓGICA: ESTADO PENDIENTE ---
    const pendingOrder = {
        items: datashopping,
        total: total,
        tax: tax,
        timestamp: Date.now()
    };
    localStorage.setItem('pending_transaction', JSON.stringify(pendingOrder));
    // --------------------------------------
    
   
    document.getElementById('paypal-button-container').innerHTML='';
    initPayPalButton(datashopping,total,tax,'#paypal-button-container',limpiacarrito,showmessageinfo)
  }
})
