import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import sanitizeHtml from 'sanitize-html'
import Linkify, { linkify } from 'react-linkify'
import { Parser, ProcessNodeDefinitions } from 'html-to-react'

import style from './index.css'

import TIcon, { ICONS_TYPES, ROTATE_TYPES } from '$trood/components/TIcon'
import DotMenu from '$trood/components/DotMenu'
import SmartDate, { SMART_DATE_FORMATS } from '$trood/components/SmartDate'

import { html2text, getTagsFromHtml } from '$trood/helpers/format'

import { FileListView } from '$trood/files'


linkify.set({ fuzzyIP: true, fuzzyEmail: false })

const html2reactParser = new Parser()
const processNodeDefinitions = new ProcessNodeDefinitions()

const createFromMailAvailableName = checkName => `${checkName}IsCreateAvailable`
const attachMailAvailableName = checkName => `${checkName}IsAttachMailAvailable`

const excludeTags = ['head', 'title', 'style', 'script', 'meta', 'base']

class Mail extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    open: PropTypes.bool,

    model: PropTypes.object,

    onMailAttach: PropTypes.func,
    modelsForCreateFormFromService: PropTypes.arrayOf(PropTypes.object),
    mailServiceActions: PropTypes.object,
    filesActions: PropTypes.object,
    actionsForCreateFormFromService: PropTypes.object,
    createFormFromEntitiesActions: PropTypes.object,
  }

  static defaultProps = {
    className: '',
    open: true,

    model: {},

    onMailAttach: () => {},
    mailServiceActions: {},
    filesActions: {},

    modelsForCreateFormFromService: [],
    actionsForCreateFormFromService: {},
    createFormFromEntitiesActions: {},
  }

  constructor(props) {
    super(props)
    this.state = {
      open: props.open,
    }
    this.toggleOpen = this.toggleOpen.bind(this)
    this.onMailAttach = this.onMailAttach.bind(this)
  }

  componentDidMount() {
    const {
      model,
      modelsForCreateFormFromService = [],
      actionsForCreateFormFromService = {},
    } = this.props
    Promise.all(
      modelsForCreateFormFromService.map(item => {
        const createEntityCheckAction = actionsForCreateFormFromService[item.createEntityActionCheckName]
        const attachMailCheckAction = actionsForCreateFormFromService[item.attachMailActionCheckName]

        let createEntityPromise = true
        let attachEntityPromise = true
        if (createEntityCheckAction) {
          createEntityPromise = createEntityCheckAction(model)
        }
        if (attachMailCheckAction) {
          attachEntityPromise = attachMailCheckAction(model)
        }
        return Promise.all([
          createEntityPromise,
          attachEntityPromise,
        ]).then((values) => {
          return {
            [createFromMailAvailableName(item.createEntityActionCheckName)]: values[0],
            [attachMailAvailableName(item.attachMailActionCheckName)]: values[1],
          }
        })
      }),
    )
      .then(res => res.reduce((memo, curr) => ({
        ...memo,
        ...curr,
      }), {}))
      .then(res => {
        // Cause of async actions, component can be unmounted at the time setState is called
        if (!this.willUnmount) {
          this.setState(res)
        }
      })
  }

  componentWillUnmount() {
    this.willUnmount = true
  }

  onMailAttach(model) {
    this.props.onMailAttach()
    this.setState({
      [createFromMailAvailableName(model.createEntityActionCheckName)]: false,
      [attachMailAvailableName(model.attachMailActionCheckName)]: false,
    })
  }

  toggleOpen() {
    this.setState({
      open: !this.state.open,
    })
  }

  render() {
    const {
      className,
      model,

      mailServiceActions,
      filesActions,

      modelsForCreateFormFromService,
      actionsForCreateFormFromService,
      createFormFromEntitiesActions,
    } = this.props

    const {
      open,
    } = this.state

    const allTags = getTagsFromHtml(model.body)
    const allowedTags = allTags.filter(tag => !excludeTags.includes(tag))
    const sanitizeProps = {
      allowedTags,
      allowedAttributes: false,
      nonTextTags: excludeTags,
    }
    let body = sanitizeHtml(model.body, sanitizeProps)

    const reactBody = html2reactParser.parseWithInstructions(body, () => true, [
      {
        shouldProcessNode: (node) => {
          return node && node.name === 'a'
        },
        processNode: (node, children, index) => {
          return processNodeDefinitions.processDefaultNode(
            {
              ...node,
              attribs: {
                ...node.attribs,
                target: '_blank',
                rel: 'nofollow noopener',
              },
            },
            children,
            index,
          )
        },
      },
      {
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode,
      },
    ])
    if (!open) body = html2text(body)

    return (
      <div className={classNames(style.root, className, !open && style.short)}>
        <div className={style.header}>
          <div className={style.left} onClick={this.toggleOpen}>
            <div className={style.title}>
              {
                open &&
                <div className={style.subject}>
                  {model.subject}
                </div>
              }
              {
                !open &&
                <div className={style.contacts}>
                  {`От: ${model.fromAddress}`}
                </div>
              }
              <SmartDate {...{
                className: style.date,
                date: model.createdAt,
                format: SMART_DATE_FORMATS.shortWithTime,
              }} />
            </div>
            {
              open &&
              <div className={style.contacts}>
                <span>
                  {`От: ${model.fromAddress}`}
                </span>
                <span>
                  {`Кому: ${model.to.join(', ')}`}
                </span>
              </div>
            }
            {
              !open &&
              <div className={style.shortBody}>
                {body}
              </div>
            }
          </div>
          <DotMenu {...{
            className: style.dotMenu,
            size: 20,
          }}>
            {modelsForCreateFormFromService.map(item => {
              const isCreateEntityAvailable = this.state[createFromMailAvailableName(item.createEntityActionCheckName)]
              const isAttachMailAvailable = this.state[attachMailAvailableName(item.attachMailActionCheckName)]
              const createAction = actionsForCreateFormFromService[item.createEntityActionName]
              const attachMailAction = actionsForCreateFormFromService[item.attachMailActionName]
              return (
                <React.Fragment key={item.modelName}>
                  {
                    isCreateEntityAvailable && createAction &&
                    <TIcon {...{
                      className: style.dotMenuItem,
                      type: ICONS_TYPES.plus,
                      size: 15,
                      label: item.createEntityActionTitle,
                      onClick: () => createAction(
                        model,
                        createFormFromEntitiesActions[item.modelName],
                        () => this.onMailAttach(item),
                      ),
                    }} />
                  }
                  {
                    isAttachMailAvailable && attachMailAction &&
                    <TIcon {...{
                      className: style.dotMenuItem,
                      type: ICONS_TYPES.plus,
                      size: 15,
                      label: item.attachMailActionTitle,
                      onClick: () => attachMailAction(
                        model,
                        () => this.onMailAttach(item),
                      ),
                    }} />
                  }
                </React.Fragment>
              )
            })}
            <TIcon {...{
              className: style.dotMenuItem,
              type: ICONS_TYPES.arrowWithTail,
              rotate: ROTATE_TYPES.down,
              size: 15,
              label: 'Ответить',
              onClick: () => mailServiceActions.replayMail(model),
            }} />
            <TIcon {...{
              className: style.dotMenuItem,
              type: ICONS_TYPES.arrowWithTail,
              size: 15,
              label: 'Переслать',
              onClick: () => mailServiceActions.forwardMail(model),
            }} />
            <TIcon {...{
              className: style.dotMenuItem,
              type: ICONS_TYPES.trashBin,
              size: 15,
              label: 'Удалить',
              onClick: () => mailServiceActions.deleteMail(model.id),
            }} />
          </DotMenu>
        </div>
        <Linkify {...{
          properties: {
            target: '_blank',
            rel: 'nofollow noopener',
          },
        }}>
          <div className={style.body}>
            {reactBody}
          </div>
        </Linkify>
        {
          !!model.attachments.length &&
          <FileListView {...{
            files: model.attachments,
            filesActions,
          }} />
        }
      </div>
    )
  }
}

export default Mail
