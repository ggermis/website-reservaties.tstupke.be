<?php /* Smarty version Smarty-3.1.21-dev, created on 2015-05-01 10:28:57
         compiled from "reservation-internal.tpl" */ ?>
<?php /*%%SmartyHeaderCode:49488324354872e1b6abbc2-40297560%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'dc96b270ce149d90802505cfcdbf766f3c652833' => 
    array (
      0 => 'reservation-internal.tpl',
      1 => 1429034429,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '49488324354872e1b6abbc2-40297560',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_54872e1b7059b0_41188426',
  'variables' => 
  array (
    'reservation' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_54872e1b7059b0_41188426')) {function content_54872e1b7059b0_41188426($_smarty_tpl) {?><h1>Reservatie-aanvraag Kampplaats 't Stupke</h1>

<p>
Er is een reservatie binnengekomen van <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_entity'];?>
 (<?php echo $_smarty_tpl->tpl_vars['reservation']->value['_name'];?>
) voor de verhuur van Kampplaats 't Stupke
voor de periode van <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_arrival'];?>
 tot <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_departure'];?>
 voor <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_nr_of_people'];?>
 personen.
</p>

<h3>Details</h3>
<ul>
    <li>Type: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_type'];?>
</li>
    <li>Vereniging: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_entity'];?>
</li>
    <li>Aantal personen: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_nr_of_people'];?>
</li>
    <li>Van: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_arrival'];?>
</li>
    <li>Tot: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_departure'];?>
</li>
    <li>Naam: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_name'];?>
</li>
    <li>Adres: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_address'];?>
</li>
    <li>Email: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_email'];?>
</li>
    <li>Telefoon: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_phone'];?>
</li>
</ul>

<h3>Opmerkingen</h3>
<?php echo $_smarty_tpl->tpl_vars['reservation']->value['_remarks'];?>
<?php }} ?>
