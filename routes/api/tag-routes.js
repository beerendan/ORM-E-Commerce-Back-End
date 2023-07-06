const router = require('express').Router();
const { on } = require('nodemon');
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  Tag.findAll({
    attributes:[
      'id',
      'tag_name'
    ],
    //include its associated Product data
    include:[
      {
        model:Product,
        attributes:[
          'id',
          'product_name',
          'price',
          'stock',
          'category_id'
        ]
      }
    ]
  })

 .then(allTagData=>res.json(allTagData))
 .catch(err=>{
  console.log(err);
  res.status(500).json(err);
 });
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  Tag.findOne({
    where:{
      id: req.params.id
    },
    attributes:[
      'id',
      'tag_name'
    ],
 //include its associated Product data
    include:[{
      attributes:[
        'id',
        'product_name',
        'price',
        'stock',
        'category_id'
      ]
    }]
})

 .then(oneTagData=>{
  if(!oneTagData){
    res.status(404).json(err)
    return;
  };
  res.json(oneTagData);
 })

 .catch(err=>{
  console.log(err);
  res.status(500).json(err);
 });
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create({
    tag_name: req.body.tag_name
  })

  .then(newTagData=>res.json(newTagData))

  .catch(err=>{
    console.log(err);
    res.status(500).json(err);
  })
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body,{
    where:{
      id: req.params.id
    },
  })
  .then(deletedTagData=>{
    if(!deletedTagData[0]){
      res.status(404).json(err);
      return;
    }
    res.json(deletedTagData)
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where:{
      id: req.params.id}
  })
  .then(deletedTagData=>{
    if(!deletedTagData){
      res.status(404).json(err);
      return;
    }
    res.json(deletedTagData)
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
