const clientKey = JSON.parse(document.getElementById('client-key').innerHTML);
const type = JSON.parse(document.getElementById('integration-type').innerHTML);


// Used to finalize a checkout call in case of redirect
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId'); // Unique identifier for the payment session
const redirectResult = urlParams.get('redirectResult');

// Start the Checkout workflow
async function startCheckout() {
	try {
	    // Init Sessions
		const checkoutSessionResponse = await callServer("/api/sessions?type=" + type);
        console.log('Session Response', checkoutSessionResponse)
        // Create AdyenCheckout using Sessions response
		const checkout = await createAdyenCheckout(checkoutSessionResponse.id, checkoutSessionResponse.sessionData, checkoutSessionResponse.billingAddress, checkoutSessionResponse.shopperName)
        console.log(checkout)
		// Create an instance of Drop-in and mount it to the container you created.
		const component = checkout.create(type).mount("#component");  // pass DIV id where component must be rendered

	} catch (error) {
		console.error(error);
		alert("Error occurred. Look at console for details");
	}
}

// Some payment methods use redirects. This is where we finalize the operation
async function finalizeCheckout() {
    try {
        // Create AdyenCheckout re-using existing Session
        const checkout = await createAdyenCheckout({id: sessionId});

        // Submit the extracted redirectResult (to trigger onPaymentCompleted(result, component) handler)
        checkout.submitDetails({details: {redirectResult}});
    } catch (error) {
        console.error(error);
        alert("Error occurred. Look at console for details");
    }
}
async function createAdyenCheckout(sID, sData, sbillingAddress, sshopperName, samount) {

    const configuration = {
        clientKey,
        locale: "en_US",
        environment: "test",  // change to live for production
        showPayButton: true,
        session: {
            id: sID,
            sessionData: sData
        },
        paymentMethodsConfiguration: {
            ideal: {
                showImage: true
            },
            card: {
                hasHolderName: false,
                holderNameRequired: true,
                //billingAddressRequired: false,
                name: "Credit or debit card",
                data: {
                    billingAddress: sbillingAddress,
                    holderName: sshopperName
                },
                enableStoreDetails: true,
                brands: ['mc', 'visa', 'amex', 'bcmc', 'cartebancaire', 'diners', 'discover', 'elo', 'hiper', 'jcb', 'maestro'],
                storedCard: {
                    hideCVC: true
                }
            },
            paypal: {
                environment: "test",
                countryCode: sbillingAddress   // Only needed for test. This will be automatically retrieved when you are in production.
            }
        },
        onPaymentCompleted: (result, component) => {
            handleServerResponse(result, component);
        },
        onError: (error, component) => {
            console.error(error.name, error.message, error.stack, component);
        }
    };
    console.log("Configuration: ", configuration)
    return new AdyenCheckout(configuration);
}


// Calls your server endpoints
async function callServer(url, data) {
	const res = await fetch(url, {
		method: "POST",
		body: data ? JSON.stringify(data) : "",
		headers: {
			"Content-Type": "application/json"
		}
	});

	return await res.json();
}

// Handles responses sent from your server to the client
function handleServerResponse(res, component) {
	if (res.action) {
		component.handleAction(res.action);
	} else {
		switch (res.resultCode) {
			case "Authorised":
				window.location.href = "/result/success";
				break;
			case "Pending":
			case "Received":
				window.location.href = "/result/pending";
				break;
			case "Refused":
				window.location.href = "/result/failed";
                console.log('Result:', res)
				break;
			default:
                console.log('Result:', res)
				window.location.href = "/result/error";
				break;
		}
	}
}

if (!sessionId) {
    startCheckout();
}
else {
    // existing session: complete Checkout
    finalizeCheckout();
}
