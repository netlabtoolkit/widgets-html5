<div class="widgetAuthoring">
    <div class="widgetTop typeIn">
        <div class="title dragHandle">
        { widget:title } <div class="remove">×</div>
        </div>
    </div>
        
    <div class="widgetLeft">
        <div class='inlets'>
            <div rv-each-inlet="widget:ins" rv-title="inlet.title" rv-data-field="inlet.to" class='inlet'>&middot;</div>
        </div>
    </div>

    <div class="widgetBody">
        <div class="widgetBodyLeft">
            <div class="inletValue"></div>
        </div>
        <div class="widgetBodyRight">
            <div class="outletValue"><span class="outputSingle" rv-text="widget:out">0</span></div>
        </div>

        <table class="rangeTable" border="0" cellspacing="3" cellpadding="0">
          <tr>
            <td><input class="range-input" type="text" pattern="[0-9]*" rv-value="widget:outputFloor"></td>
            <td><input class="range-input" type="text" pattern="[0-9]*" rv-value="widget:outputCeiling"></td>
          </tr>
        </table>
        <input class="buttonLabel" class="fullWidthInput" type="text" rv-value="widget:buttonLabel">
    </div>

    <div class="widgetRight">
        <div class='outlets'>
            <div class="outlet" rv-each-outlet="widget:outs" rv-alt="outlet.title" rv-data-field="outlet.to">&middot;</div>
        </div>
    </div>

    <div class="widgetBottom">
        <div class="tab"><p>more</p></div>
        <div class="content">
            <label class="narrowLabel">width</label> <input class="buttonWidth" class="moreParam" type="text" pattern="[0-9]*" rv-value="widget:buttonWidth"><br>
            <label class="narrowLabel">height</label> <input class="buttonHeight" class="moreParam" type="text" pattern="[0-9]*" rv-value="widget:buttonHeight"><br>
            <label class="narrowLabel">size</label> <input class="buttonFontSize" class="moreParam" type="text" pattern="[0-9]*" rv-value="widget:buttonFontSize"><br>
        </div>
    </div>
</div>

<% if(!server) { %>
    <div class="detachedEl" 
        rv-style-opacity="widget:opacity"
        rv-positionx="widget:left"
        rv-positiony="widget:top">
        <button id="theButton"></button>
        <div class="dragKnob widgetAuthoring">Drag</div>
    </div>
<% } %>
