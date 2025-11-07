interface OrderConfirmationEmailProps {
  order: {
    id: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      postalCode: string;
    };
    total: number;
  };
}

export const OrderConfirmationEmail = ({
  order,
}: OrderConfirmationEmailProps) => (
  <div>
    <h1>Pedido Confirmado!</h1>
    <p>Olá {order.customerName},</p>
    <p>
      Seu pedido #{order.id.slice(0, 8)} foi confirmado e está sendo processado.
    </p>

    <h2>Itens do Pedido:</h2>
    <ul>
      {order.items.map((item, index) => (
        <li key={index}>
          {item.quantity}x {item.name} - {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(item.price * item.quantity)}
        </li>
      ))}
    </ul>

    <h2>Total do Pedido:</h2>
    <p>
      {new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(order.total)}
    </p>

    <h2>Endereço de Entrega:</h2>
    <p>
      {order.address.street}, {order.address.number}
      {order.address.complement && ` - ${order.address.complement}`}
      <br />
      {order.address.neighborhood}
      <br />
      {order.address.city}/{order.address.state}
      <br />
      CEP: {order.address.postalCode}
    </p>

    <p>
      Você receberá atualizações sobre o status do seu pedido por e-mail.
      Obrigado por comprar na HYPEX!
    </p>
  </div>
);