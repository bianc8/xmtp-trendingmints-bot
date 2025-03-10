import { fetchQuery, init } from "@airstack/node";
import {
  NftDetailQuery,
  TimeFrame,
  TrendingMintsCriteria,
  TrendingsMintsQuery,
} from "./airstack-types";
import { getRedisClient } from "../lib/redis.js";

//init(process.env.AIRSTACK_API_KEY as string);

export const TRENDING_MINTS_QUERY_BASE =
  /* GraphQL */
  `
    query TrendingsMints(
      $timeFrame: TimeFrame!
      $criteria: TrendingMintsCriteria!
    ) {
      TrendingMints(
        input: {
          timeFrame: $timeFrame
          audience: all
          blockchain: base
          criteria: $criteria
        }
      ) {
        TrendingMint {
          address
          erc1155TokenID
          criteriaCount
          timeFrom
          timeTo
          token {
            name
            symbol
            type
            tokenNfts {
              contentValue {
                image {
                  original
                  medium
                  large
                  extraSmall
                  small
                }
              }
            }
          }
        }
      }
    }
  `;

interface QueryResponse {
  data: TrendingsMintsQuery | null;
  error: Error | null;
}

interface Error {
  message: string;
}

const NFT_DETAIL_QUERY_BASE =
  /* GraphQL */
  `
    query NFTDetail($address: Address!) {
      TokenNfts(
        input: { filter: { address: { _eq: $address } }, blockchain: base }
      ) {
        TokenNft {
          tokenURI
          contentValue {
            image {
              small
              medium
            }
          }
          metaData {
            name
            description
          }
        }
      }
    }
  `;

interface NFTQueryResponse {
  data: NftDetailQuery | null;
  error: Error | null;
}

export const cacheNft = async (address: string) => {
  const redis = await getRedisClient();

  const cachedNft = await redis.get(address);

  if (cachedNft) {
    return JSON.parse(cachedNft);
  }
  const { data, error }: NFTQueryResponse = await fetchQuery(
    NFT_DETAIL_QUERY_BASE,
    {
      address,
    }
  );

  if (error) {
    console.error(error);
    process.exit(1);
  }

  if (!data || !data.TokenNfts || data.TokenNfts.TokenNft?.length === 0) {
    if (process.env.DEBUG) console.error("No NFT found", address);
    return null;
  }

  const nft = data.TokenNfts.TokenNft![0];

  const thirtyDaysInSeconds = 60 * 60 * 24 * 30;
  await redis.setEx(address, thirtyDaysInSeconds, JSON.stringify(nft));
};

export const fetchTrendingMints = async (
  timeFrame: TimeFrame,
  criteria: TrendingMintsCriteria
) => {
  // Temporary fake data
  // Extended fake data
  const fakeData = [
    {
      address: "0x8609fc45c17cfaed5710e998a98cfe634cee05aa",
      criteriaCount: 56,
    },
    {
      address: "0x9b500ee2c31d3db8e5f08b3bbf3113e7803644de",
      criteriaCount: 49,
    },
    {
      address: "0x7d6f123a49868fa178ddf8284a5d53ab52189fb3",
      criteriaCount: 46,
    },
    {
      address: "0xd2c2d1ac51ba7d1ec74da90b07b0fc3fb55294ec",
      criteriaCount: 367,
    },
    {
      address: "0x61102227bcdf642725f91d37f43ca441abc33c86",
      criteriaCount: 104,
    },
    {
      address: "0x64c396a02e4fd67aeacf05d7e7d1d179ce63a8a3",
      criteriaCount: 41,
    },
    {
      address: "0xf9eb4885b3ebda09b28ac4e9630db13adb0ef59e",
      criteriaCount: 85,
    },
    {
      address: "0x870381bba5ae811e6c35c3088378b5f5afb8f9b3",
      criteriaCount: 1825,
    },
    {
      address: "0x2ebdcabd72265d21980ac53dd282ea54d7b172a2",
      criteriaCount: 40,
    },
    {
      address: "0x931f3a41078725e85c8fc0bf8204f277d3ccbd11",
      criteriaCount: 23,
    },
    {
      address: "0x366e0ba310ed1b703aca4a421cbe53a5655ca634",
      criteriaCount: 12,
    },
    {
      address: "0x81cdf5e6e3f26a8b83814366e3c397477d3b8a0a",
      criteriaCount: 43,
    },
    {
      address: "0xd2c2d1ac51ba7d1ec74da90b07b0fc3fb55294ec",
      criteriaCount: 1063,
    },
    {
      address: "0x05490ae02f71d2f3d1c96a7e62b44a1b2348c66b",
      criteriaCount: 45,
    },
    {
      address: "0x9252300cfb276d12ccd9947860d26f091decc9a2",
      criteriaCount: 57,
    },
  ];

  return fakeData;
  /*
  const { data, error }: QueryResponse = await fetchQuery(
    TRENDING_MINTS_QUERY_BASE,
    {
      timeFrame,
      criteria,
    }
  );

  if (error) {
    console.error(error);
    process.exit(1);
  }

  if (
    !data ||
    !data.TrendingMints ||
    data.TrendingMints.TrendingMint?.length === 0
  ) {
    console.error("No trending mints found in timeframe:", timeFrame);
    return [];
  }

  return data.TrendingMints.TrendingMint;*/
};
