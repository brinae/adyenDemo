# Working Adyen Example
## Demos:
Tokenization, /paymentMethods, /sessions, Drop-In, and Components

1. Clone Repo
2. Set up .env file as follows:
   - ![.env file](https://user-images.githubusercontent.com/108417082/180848572-75f4986d-8013-45f5-8878-74ee7030ba94.png)

3. In Terminal: 
    - Type `source ./setup.sh` 
    - Type  `./start.sh` 
    
4. Add images of the products you'd like to sell in `static/uploads`

5. Open a private web browser window and go to: http://localhost:8080/add

6. Add a product, make sure to import the image from the `uploads` folder mentioned above

7. From http://localhost:8080/ click `Sign In` and register a user.
   - Does not have to be a real email, there is no external communication. Passwords must match. Make sure to add a currency. 
   - I base my users on region, so I make a user for each country I want to test
   
8. Once you sign in, you should be able to add a product to your cart. 
   - Click on product, and add to cart from the product details page. 
   - Click on the `cart items` link on the top left to go to your cart and start a checkout option. 
 
