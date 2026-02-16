// paypal-module.js

export function initPayPalButton(listaProductos,totalAmount,tax, containerId,limpiacb,sm) {
    
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
                
                localStorage.removeItem('pending_transaction');
                limpiacb();
                
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
            
            .catch(function(error) {
                    sm({ 
                        message: 'Were sorry, there was a technical problem processing your payment. Please try again.', 
                        color: 'red',
                        time:5 
                    });
                });
        },
        onCancel: function (data) {
                    sm({
                        message: 'The payment was cancelled. Your items are still in the cart.',
                        color: 'orange',
                        time:5
                    });
        },
        onError: function(err) {
            console.error("Error en el flujo de PayPal:", err);
            sm({
                message: 'The transaction was interrupted or could not be completed. Please verify your payment method or try again.',
                color: 'red',
                time:5
            });
        }
    }).render(containerId);
}