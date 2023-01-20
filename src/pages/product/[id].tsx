import Image from "next/image";
import { stripe } from "@/lib/stripe";
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from "@/styles/pages/product";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Stripe from "stripe";
import axios from "axios";
import { useState } from "react";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({ product }: ProductProps) {
  // const { isFallback } = useRouter();
  // if (isFallback) {
  //   return <p>Loading ...</p>;
  // }
  // const router = useRouter(); //redirecionamento interno
  const [isCreatingCheckout, SetIsCreatingCheckout] = useState(false);
  async function handleBuyProduct() {
    try {
      SetIsCreatingCheckout(true);
      const response = await axios.post("/api/checkout", {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      // router.push("/checkout"); //redirecionamento interno

      window.location.href = checkoutUrl; //redirecionamento externo
    } catch (err) {
      //conectar com uma ferramenta de observabilidade (Datadog/ sentry)
      SetIsCreatingCheckout(false);
      alert("Falha ao redirecionar ao checkout");
    }
  }
  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageUrl} width={520} height={480} alt="" />
      </ImageContainer>
      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>
        <p>{product.description}</p>
        <button disabled={isCreatingCheckout} onClick={handleBuyProduct}>
          Comprar agora
        </button>
      </ProductDetails>
    </ProductContainer>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: "prod_NBQM1l0IPqGBZg" } }],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  const productId = params?.id || "";

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  const price = product.default_price as Stripe.Price;

  if (!price.unit_amount) {
    return {
      props: {},
      revalidate: 60 * 60 * 1, //1 hour
    };
  }
  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      },
    },
    revalidate: 60 * 60 * 1, //1 hour
  };
};
