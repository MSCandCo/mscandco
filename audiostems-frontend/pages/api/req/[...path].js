import axios from "axios";
import { getToken } from "next-auth/jwt";

export default async function cases(req, res) {
  try {
    const { path, ...query } = req.query;

    const reqPath = path.join("/");
    const reqQuery = new URLSearchParams(query).toString();

    const token = await getToken({ req });
    const tokenString = token.jwt;

    const response = await axios({
      method: req.method,
      url: `${process.env.NEXT_PUBLIC_STRAPI}/api/${reqPath}/?${reqQuery}`,
      data: req.body,
      headers: {
        Authorization: tokenString ? `Bearer ${tokenString}` : null,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error?.response?.status || 500)
      .json(
        error?.response?.headers["content-type"]?.includes("application/json")
          ? error?.response?.data
          : { detail: error.message }
      );
  }
}
