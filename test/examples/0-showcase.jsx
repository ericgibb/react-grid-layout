import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import _ from 'lodash';
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ShowcaseLayout extends Component {

  static propTypes = {
    onLayoutChange: PropTypes.func.isRequired
  };

  static defaultProps = {
    className: "layout",
    rowHeight: 30,
    cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
    initialSectionsLayouts: _.groupBy(generateLayout(), 'section')
  };

  state = {
    currentBreakpoint: 'lg',
    mounted: false,
    sectionsLayouts: this.props.initialSectionsLayouts
  };

  componentDidMount() {
    this.setState({
      mounted: true,
      sectionsBounds: this.getSectionsBounds(this.state.sectionsLayouts),
    });
  };

  generateDOM(sectionGridLayout, sectionKey) {
    return _.map(sectionGridLayout, function(l, i) {
      return (
        <div key={l.i} className={l.static ? 'static' : ''}>
          {l.static ?
            <span className="text" title="This item is static and cannot be removed or resized.">Static - {i}</span>
            : <span className="text">{l.title} key {l.i}</span>
          }
        </div>);
    });
  };

  onBreakpointChange = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint
    });
  };

  onLayoutChange = (layout, layouts) => {
    console.log('ON LAYOUT CHANGED', this.state.sectionsLayouts);
    //this.setState({
    //  sectionsBounds: this.getSectionsBounds(this.state.sectionsLayouts),
    //});
    this.props.onLayoutChange(layout, layouts);
  };

  onGridItemDragStart = (layout, oldDragItem, l, placeholder, e, node)=> {
    console.log('onGridItemDragStart', layout, oldDragItem, l, e, node);
  };

  onGridItemDrag = ()=> {
    console.log('onGridItemDrag');
  };

  onGridItemDragStop = () => {
    console.log('onGridItemDragStop')
  };

  getLayoutBounds(node) {
    const clientRect = node.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft;
    const scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
    return {
      left: clientRect.left + scrollLeft,
      top: clientRect.top + scrollTop,
      bottom: clientRect.bottom,
      right: clientRect.right,
      width: clientRect.width,
      height: clientRect.height,
    };
  }


  onGridItemChangeSection = (i, fromSectionKey, sectionKey, toPosition)=> {
    const gridItemSectionIndex = _.findIndex(this.state.sectionsLayouts[fromSectionKey], {i: i});
    const gridItemToMove = _.cloneDeep(this.state.sectionsLayouts[fromSectionKey][gridItemSectionIndex]);
    gridItemToMove.section = sectionKey;
    gridItemToMove.drag = true;
    gridItemToMove.dragPosition = toPosition;

    const newState = this.state.sectionsLayouts;
    newState[fromSectionKey] = newState[fromSectionKey].filter(gridItem => gridItem.i !== i);
    newState[sectionKey] = [...newState[sectionKey], gridItemToMove];
    this.setState({
      sectionsLayouts: newState,
    });
  };


  getSectionsBounds(sections) {
    return Object.keys(sections).reduce((acc, key)=> {
      acc[key] = this.getLayoutBounds(findDOMNode(this[`${key}`]));
      return acc;
    }, {})
  }


  renderGridLayouts() {
    return Object.keys(this.state.sectionsLayouts).map((sectionKey, index)=> {
      const sectionData = this.state.sectionsLayouts[sectionKey];
      return (
        <div key={`${sectionKey}_${index}`}>
          <div>Section Title: {sectionKey}</div>
          <ResponsiveReactGridLayout
            ref={(refGridLayout)=>{this[`${sectionKey}`] = refGridLayout}}
            {...this.props}
            layouts={{lg:sectionData}}
            section={`${sectionKey}`}
            sectionsBounds={this.state.sectionsBounds}
            onBreakpointChange={this.onBreakpointChange}
            onLayoutChange={this.onLayoutChange}
            onDragStart={this.onGridItemDragStart}
            onDrag={this.onGridItemDrag}
            onDragStop={this.onGridItemDragStop}
            onChangeSection={this.onGridItemChangeSection}
            // WidthProvider option
            measureBeforeMount={false}
            // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
            // and set `measureBeforeMount={true}`.
            useCSSTransforms={this.state.mounted}>
            {this.generateDOM(sectionData, sectionKey)}
          </ResponsiveReactGridLayout>
        </div>
      );
    })
  }

  render() {
    return (
      <div>
        <div>
          Current Breakpoint: {this.state.currentBreakpoint} ({this.props.cols[this.state.currentBreakpoint]} columns)
        </div>
        {this.renderGridLayouts()}
      </div>
    );
  }
}

module.exports = ShowcaseLayout;

function generateLayout() {
  return _.map(_.range(0, 25), function(item, i) {
    var y = Math.ceil(Math.random() * 4) + 1;
    const section = i > 10 ? 'ana' : 'mere';
    return {
      x: _.random(0, 5) * 2 % 12,
      section: section,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: `${i}`,
      title: `${section}-${i}`,
      drag: false,
      static: Math.random() < 0.05
    };
  });
}

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
