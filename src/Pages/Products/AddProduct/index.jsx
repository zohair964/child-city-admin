import axios from "axios";
import { Container, Grid, Group, SimpleGrid } from "@mantine/core";
import { useMutation, useQuery } from "react-query";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import InputField from "../../../components/InputField";
import TextArea from "../../../components/TextArea";
import Button from "../../../components/Button";
import PageHeader from "../../../components/PageHeader";
import { backendUrl, colors } from "../../../constants/constants";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../contexts/UserContext";
import { useLocation, useNavigate } from "react-router";
import { routeNames } from "../../../Routes/routeNames";
import SelectMenu from "../../../components/SelectMenu";
import MultiSelect from "../../../components/MultiSelect";
import MultipleDropzone from "../../../components/MultipleDropzone";
import {
  uploadMultipleImages,
  uploadSingleFile,
} from "../../../constants/firebase";

export const AddProduct = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  let { state } = useLocation();
  const [colorss, setColors] = useState(colors);
  const [categories, setCategories] = useState([]);

  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      title: "",
      category: "",
      season: "",
      colors: [],
      sizes: [],
      price: "",
      sale: "",
      quantity: 0,
      sku: "",
      description: "",
      images: [],
    },

    validate: {
      title: (value) =>
        value?.length > 1 && value?.length < 30
          ? null
          : "Please enter product title",
      category: (value) =>
        value?.length > 0 ? null : "Please select product category",
      price: (value) => (value > 0 ? null : "Please enter product price"),
      quantity: (value) =>
        value >= 0 ? null : "Please select product quantity",
      sku: (value) => (value?.length > 0 ? null : "Please select product sku"),
      description: (value) =>
        value?.length > 0 ? null : "Please enter product description",
      images: (value) =>
        value.length > 0 ? null : "Please upload product image",
    },
  });

  useEffect(() => {
    if (state?.isUpdate) {
      form.setValues(state.data);
      form.setFieldValue("category", state?.data?.category?._id);
    }
  }, [state]);
  const handleAddProduct = useMutation(
    async (values) => {
      const urls = await uploadMultipleImages(values.images, "Products");
      values.images = urls;
      if (state?.isUpdate)
        return axios.put(
          `${backendUrl + `/product/${state?.data?._id}`}`,
          values
        );
      else {
        return axios.post(`${backendUrl + "/product"}`, values, {});
      }
    },
    {
      onSuccess: (response) => {
        showNotification({
          title: "Success",
          message: response?.data?.message,
          color: "green",
        });
        navigate(routeNames.general.viewProducts);
        form.reset();
      },
    }
  );

  const { status } = useQuery(
    "fetchCategories",
    () => {
      return axios.get(backendUrl + "/category", {});
    },
    {
      onSuccess: (res) => {
        let cat = res.data.data
          .filter((obj) => !obj?.blocked)
          .map((obj) => {
            if (!obj?.blocked) return { label: obj.title, value: obj?._id };
          });

        setCategories(cat);
      },
    }
  );
  return (
    <Container fluid>
      <PageHeader label={state?.isUpdate ? "Edit Product" : "Add Product"} />
      <form
        onSubmit={form.onSubmit((values) => handleAddProduct.mutate(values))}
      >
        <Grid>
          <Grid.Col sm={12}>
            <InputField
              label={"Title"}
              placeholder={"Enter Product Title"}
              form={form}
              withAsterisk
              validateName={"title"}
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <SelectMenu
              data={categories}
              label="Select Category"
              withAsterisk
              form={form}
              validateName="category"
              placeholder="Select Category"
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <SelectMenu
              data={["Winters Collection", "Summers Collection"]}
              label="Select Season"
              placeholder="Select Season"
              form={form}
              validateName="season"
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <MultiSelect
              data={colorss}
              label="Select Colors"
              placeholder="Select Colors"
              form={form}
              creatable={true}
              searchable={true}
              validateName="colors"
              getCreateLabel={(query) => `+ Create ${query}`}
              onCreate={(query) => {
                const item = query;
                setColors((current) => [...current, item]);
                return item;
              }}
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <MultiSelect
              data={["3-6M", "6-9M", "1-2Y", "2-3Y", "3-4Y"]}
              label="Select Sizes"
              placeholder="Select Sizes"
              form={form}
              validateName="sizes"
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <InputField
              label={"Price"}
              placeholder={"Enter Product Price"}
              withAsterisk
              type="number"
              form={form}
              validateName="price"
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <InputField
              label={"Sale"}
              placeholder={"Enter Sale in Percent"}
              type="number"
              form={form}
              validateName="sale"
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <InputField
              label={"Quantity"}
              placeholder={"Enter Product Quantity"}
              type="number"
              withAsterisk
              form={form}
              validateName="quantity"
            />
          </Grid.Col>
          <Grid.Col sm={6}>
            <InputField
              label={"SKU"}
              placeholder={"Enter Product SKU"}
              withAsterisk
              form={form}
              validateName="sku"
            />
          </Grid.Col>
          <Grid.Col sm={12}>
            <TextArea
              label={"Description"}
              placeholder={"Enter Product Description"}
              rows="4"
              form={form}
              withAsterisk
              validateName={"description"}
            />
          </Grid.Col>
        </Grid>
        <MultipleDropzone
          form={form}
          fieldName={"images"}
          type={"image"}
          maxFiles={10}
          subText={"Upload Product Images"}
        />
        <Group position="right" mt={"md"}>
          <Button
            label={"Cancel"}
            variant={"outline"}
            onClick={() => navigate(routeNames.general.viewProducts)}
          />
          <Button
            label={state?.isUpdate ? "Edit Product" : "Add Product"}
            type={"submit"}
            loading={handleAddProduct.isLoading}
          />
        </Group>
      </form>
    </Container>
  );
};
