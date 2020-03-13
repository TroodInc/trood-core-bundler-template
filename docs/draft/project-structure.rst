================================
Project structure
================================
Yout can add 2 types of entities to the project:

Business objects library
------------------------
Business objects library is a collection of your business objects models with front-end part of business logic attached to them. It's simplier to create business objects schema in Custodian and then to create it's front-end configuration. In future releases we are planning on making a single business object config, that is used both for Custodian and front-end.

To add a library, just go to ``src/businessObjects`` and add a folder with your library name.

A business object library should contain a ``config.js`` or ``config.json`` file, describing all business objects and their relations and usage of Trood Core services in that library.

It can look something like that:

.. code-block:: default

    export default {
      title: 'MyBusinessObjects',
      models: [
        {
          title: 'comment',
          dependsOn: ['employee'],
        },
        {
          title: 'employee',
          services: ['files'],
          modal: {
            deleteActionDisabled: true,
          },
        },
      ]
    }

For example, you have a ``comment`` Custodian entity with a simple config:

.. code-block:: default

    {
      "name": "comment",
      "key": "id",
      "fields": [
        {
          "name": "id",
          "type": "number",
          "optional": true,
          "default": {
            "func": "nextval"
          }
        },
        {
          "name": "created",
          "type": "datetime",
          "optional": true,
          "default": {
            "func": "now"
          }
        },
        {
          "name": "author",
          "type": "object",
          "linkMeta": "employee",
          "linkType": "inner",
          "optional": false,
          "onDelete": "cascade"
        },
        {
          "name": "comment",
          "type": "string",
          "optional": false
        },
        {
          "name": "target_object",
          "type": "generic",
          "linkMetaList": [
              "contractor",
              "supplier",
              "base_order",
              "task"
          ],
          "linkType": "inner",
          "optional": false,
          "onDelete": "cascade"
        }
      ],
      "cas": false
    }

After adding a config, you should create the object itself, by adding a subfolder with the same name, as in ``title`` field in your library and some files:

.. code-block:: default

    src/
      businessObjects/
        MyBusinessObjects/
          comment/
            model.js
            form.js
            editComponent.js
            actions.js
          config.js

You should create a corresponding front-end model config in ``model.js`` file, for your business object, using `redux-restify docs <https://github.com/DeyLak/redux-restify/tree/master/docs>`_
:

.. code-block:: default
   :linenos:

    import { RestifyGenericForeignKey, RestifyForeignKey } from 'redux-restify'
        
    export default {
      defaults: {
        id: undefined,
        created: undefined,
        author: new RestifyForeignKey('employee'),
        comment: undefined,
        targetObject: new RestifyGenericForeignKey(
          ['contractor', 'supplier', 'baseOrder', 'task'],
          {
            allowNested: false,
          },
        ),
      },
      deletion: {
        confirm: true,
      },
      name: 'Comment',
    }

Also, if your object should be editable from your system(non-editable entities are usually some dictionaries, constant lists etc.), you should add a ``form.js`` file for restify form, that is used to map server model into form data:

.. code-block:: default

    export default {
      defaults: {
        id: undefined,
        author: undefined,
        comment: undefined,
        created: undefined,
        targetObject: undefined,
      },
      submitExclude: {
        created: true,
      },
      mapServerDataToIds: true,
    }

Now, we have a form configuration, but we still don't know, how that form should be displayed and edited in our system. For this, we should edit our ``editComponent.js`` file. By default, Entity Manager allows all entities in Trood Core app to be edited, using modal windows. This modal window is using ``editComponent.js``, which is just a React component file, and passed it some props, that are used to edit and display the business object form. Comment entity ``editCompoent.js`` could look like this:

.. code-block:: default
   :linenos:

    import PropTypes from 'prop-types'
    import React, { PureComponent } from 'react'
    import classNames from 'classnames'
    import moment from 'moment'
    import modalsStyle from '$trood/styles/modals.css'
    
    import TInput, { INPUT_TYPES } from '$trood/components/TInput'
    
    
    class EditComponent extends PureComponent {
      static propTypes = {
        className: PropTypes.string,
    
        model: PropTypes.object.isRequired, // Restify form of the comment entity
        modelErrors: PropTypes.object, // Errors of the restify form
        modelValid: PropTypes.bool, // Is form valid. See restify docs to know more about these fields
    
        modelFormActions: PropTypes.object, // Restify actions to edit model form
      }
    
      static defaultProps = {
        className: '',
    
        modelFormActions: {},
      }
    
      render() {
        const {
          className,
    
          model,
          modelErrors,
    
          modelFormActions,
        } = this.props
    
        return (
          <div {...{
            className: classNames(modalsStyle.root, className),
          }} >
            <TInput {...{
              className: modalsStyle.control,
              type: INPUT_TYPES.multi,
              defaultValue: model.comment,
              replaceValue: model.comment,
              onChange: value => modelFormActions.changeField('comment', value),
              onInvalid: errs => modelFormActions.setFieldError('comment', errs),
              onValid: () => modelFormActions.resetFieldError('comment'),
              errors: modelErrors.comment,
              validate: {
                required: true,
                checkOnBlur: true,
              },
            }} />
          </div>
        )
      }
    }
    
    export default EditComponent



Components library
------------------

Each Trood Core app should use at least one components library, so it can display custom components. Again, let’s start with adding new library and some basic components to our project:

.. code-block:: default

    src/
      componentsLibraries/
        MyComponents/
          CommentsListView/
            index.js
            index.css
          config.js

Let’s have a look at our ``config.js``:

.. code-block:: default

    {
      "title": "MyComponents",
      "components": [
        {
          "title": "CommentsListView",
          "models": [
            {
              "name": "comment"
            }
          ]
        },
      ]
    }

Important thing here, is to define, which models, components are expecting to receive, so we can query some data to display. Also, read about, how component can use different business objects as it’s model input, in docs. Now, after creating a config, we can write simple react component to display models data:

.. code-block:: default
   :linenos:

    import PropTypes from 'prop-types'
    import React, { PureComponent } from 'react'
    
    
    class CommentsListView extends PureComponent {
      render() {
        const {
          className,
    
          commentEntities,
    
          commentEditorActions,
        } = this.props
    
        // Get available comments array from server
        // For filtering read restify docs
        // Custodian also uses [rql](https://github.com/kriszyp/rql) for filtering requests
        const commentsArray = commentEntities.getArray()
    
        return (
          <div>
            <TButton {...{
              onClick: () => commentEditorActions.editEntity(),
              label: 'Add comment',
            }} />
            {commentsArray.map(comment => (
              <div>
                <span className="comment-text">{comment.comment}</span>
                <TButton {...{
                  onClick: () => commentEditorActions.editEntity(comment.id),
                  label: 'Edit',
                }} />
              </div>
            ))}
          </div>
        )
      }
    }
    
    export default CommentsListView