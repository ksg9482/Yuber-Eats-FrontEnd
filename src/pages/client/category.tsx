import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Restaurant } from "../../components/restaurant";
import { CATEGORY_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragment";
import { category, categoryVariables } from "../../__generated__/category";

const CATEGORY_QUERY = gql`
  query category($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      totalPages
      totalResults
      restaurants {
        ...RestaurantParts
      }
      category {
        ...CategoryParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${CATEGORY_FRAGMENT}
`;

interface ICategoryParams {
  slug: string;
}

export const Category = () => {
  const [page, setPage] = useState(1)
  const params = useParams<ICategoryParams>();
  const { data:categoryData, loading } = useQuery<category, categoryVariables>(
    CATEGORY_QUERY,
    {
      variables: {
        input: {
          page: 1,
          slug: params.slug
        },
      },
    }
  );

  const onNextPageClick = () => setPage((currentPage) => currentPage + 1);
  const onPrevPageClick = () => setPage((currentPage) => currentPage - 1);

  
  console.log(categoryData?.category.totalPages)
  return (
    <div>
      <Helmet>
        <title>
          Category - {categoryData?.category.category?.name} | Yuber Eats
        </title>
      </Helmet>
      {!loading && (
        <div className="max-w-screen-2xl pb-20 mx-auto mt-8">
          <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
            {categoryData?.category.restaurants?.map((restaurant) => (
              <Restaurant
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                coverImg={restaurant.coverImg}
                categoryName={restaurant.category?.name}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 text-center max-w-md items-center mx-auto mt-10">
            {page > 1 ? (
              <button
                onClick={onPrevPageClick}
                className="focus:outline-none font-medium text-2xl"
              >
                &larr;
              </button>
            )
              : (
                <div></div>
              )}
            <span>
              Page {page} of {categoryData?.category.totalPages}
            </span>
            {
              page !== categoryData?.category.totalPages ? (
                <button
                  onClick={onNextPageClick}
                  className="focus:outline-none font-medium text-2xl"
                >
                  &rarr;
                </button>
              ) : (
                <div></div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
   
}