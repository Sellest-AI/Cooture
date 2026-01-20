import { stripe } from './stripe.config';

type Customer = { id: string, email: string, name?: string }

/** This creates a customer in stripe
  * @param customer - The customer to create
 */
export const createCustomer = async (customer: Customer) => {
  // check if the user exists in stripe first
  const existingCustomer = await stripe.customers.list({
    email: customer.email,
    limit: 1
  });

  if (existingCustomer.data.length > 0) {
    return existingCustomer.data[0];
  }

  return await stripe.customers.create({
    metadata: { userId: customer.id },
    email: customer.email,
    name: customer.name
  });
}