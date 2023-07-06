const router = require('express').Router();
const { on } = require('nodemon');
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  Product.findAll({
    attributes:[
      'id',
      'product_name',
      'price',
      'stock',
      'category_id'
    ],
    include:[{
      model: Category,
      attributes:[
        'id',
        'category_name',
      ]
    },
    {
      model: Tag,
      attributes:[
        'id',
        'tag_name'
      ]
    }
    ]
  })
  //return results to be displayed
  .then(allProductData=>res.json(allProductData))

  .catch(err=>{
    console.log(err);
    res.status(500).json(err)
  });
});

// get one product
router.get('/:id', (req, res) => {
  Product.findOne({
    where:{
    // find a single product by its `id`
      id:req.params.id
    },
    attributes:[
      'id',
      'product_name',
      'price',
      'stock',
      'category_id'
    ],
     //include its associated Category and Tag data
    include:[
      {
        model: Category,
        attributes:[
          'id',
          'category_name'
        ]
      },
      {
        model: Tag,
        attributes:[
          'id',
          'tag_name'
        ]
      }
    ]
  })
  //return result to be displayed and verify valid id
  .then(oneProductData=>{
    if (!oneProductData){
      res.status(404).json(err);
      return;
    }
    res.json(oneProductData);
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json(err);
  });
 
});

// create new product
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where:{
      //find it by its id
      id:req.params.id
    }
  })
  //then delete it
  .then(deleteProductData=>{
    if(!deleteProductData){
      res.status(404).json(err);
      return;
    }
    res.json(deleteProductData)
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json(err);
  })
});

module.exports = router;
