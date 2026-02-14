// paypal-module.js

export function initPayPalButton(listaProductos,totalAmount,tax, containerId,limpiacb,sm) {
    //lista de productos (array de objetos con formato let selecprod={
    //   name:actualprod.name,
    //   unit_amount:{
    //           currency_code: "USD",
    //           value: actualprod.price.toString()
    //         },
    //   quantity:$modalquantity.value
    // })

    //totalamoun es el total que se envia
    //containerId es el contenedor donde estaran los botones '#paypal-button-container'

    // item_total: La suma de (precio × cantidad) de todos los productos sin impuestos.

    // tax_total: El monto total de impuestos.

    // value (el de arriba): Debe ser exactamente la suma de item_total + tax_total.
    let totafinal=(parseFloat(totalAmount) + parseFloat(tax)).toFixed(2);

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency_code: "USD",
                        value: totafinal.toString(),  //total final + impuestos
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: totalAmount.toString()   //total suma de productos sin impuestos
                            },
                            //impuestos poner aqui
                            tax_total: {
                                currency_code: "USD",
                                value: tax         //"15.00" // El 15% de impuesto
                            },
                            // shipping: {
                            //     currency_code: "USD",
                            //     value: "10.00" // El 10% de envío
                            // }
                        }
                    },
                    // Mapeo directo sin divisiones
                    items: listaProductos.map(item => ({
                        name: item.name,
                        unit_amount: {
                            currency_code: "USD",
                            value: item.unit_amount.value // Ya viene con 2 decimales desde index.js
                        },
                        quantity: item.quantity.toString()
                    }))
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Aquí podrías disparar un evento personalizado o una función de éxito
                console.log("Pago exitoso:", details);
                //alert(`Gracias ${details.payer.name.given_name}, el pago fue aprobado.`);
                localStorage.removeItem('pending_transaction');
                limpiacb();
                // Ejemplo: Redirigir a página de agradecimiento
                //aqui se deberia ver como borrar el form, cerrar el modal, vaciar localstorage
                const transactionId = details.purchase_units[0].payments.captures[0].id;
                let detailobj={
                    orderid:transactionId, 
                    client:details.payer, 
                    units:details.purchase_units
                }
                localStorage.setItem('lasttrans',JSON.stringify(detailobj))
               window.location.href = "/thanks.html";
            })
            //*************prueba fondos insifucientes *********************************************************/
            .catch(function(error) {
        // AQUÍ es donde debería caer si el monto es 51.00
                    console.error("Error detectado:", error);
                    if (error.debug_id) {
                    alert("Simulación de Fondos Insuficientes exitosa. Error: " + error.name);
                    }
    });
        },
        onCancel: function (data) {
                    sm({
                        message: 'The payment was cancelled. Your items are still in the cart.',
                        color: 'orange'
                    });
        },
        onError: function(err) {
            console.error("Error en el flujo de PayPal:", err);
            sm({
                message: 'There was a problem processing your payment. Please try again.',
                color: 'red'
            });
        }
    }).render(containerId);
}